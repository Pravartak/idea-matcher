"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	Home,
	PlusSquare,
	Search,
	Info,
	FolderKanban,
	Users,
	UserPlus,
	Bell,
	Menu,
	MessageSquare,
	X,
	LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/firebase";
import {
	arrayUnion,
	collection,
	doc,
	getDoc,
	getDocs,
	limit,
	orderBy,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Post, PostCard } from "@/components/postComponents/PostComponents";
import { getMessaging, getToken } from "firebase/messaging";

const navItems = [
	{ icon: Home, label: "Home", href: "/home", active: true },
	{ icon: PlusSquare, label: "Create Post", href: "/create-post" },
	{ icon: Search, label: "Search", href: "/search" },
	{ icon: MessageSquare, label: "Chats", href: "/chats" },
];

const secondaryNavItems = [
	{ icon: Info, label: "About", href: "/about" },
	{ icon: FolderKanban, label: "Projects", href: "/projects" },
	{ icon: Users, label: "Hackathon Teams", href: "/hackathon-teams" },
	{ icon: UserPlus, label: "Connections", href: "/connections" },
	{ icon: Bell, label: "Notifications", href: "/notifications", badge: true },
];

function GuestLoginDialog({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	if (!isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
			onClick={onClose}>
			<div
				className="bg-background border border-border rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl animate-in zoom-in-95 duration-200"
				onClick={(e) => e.stopPropagation()}>
				<div className="text-center space-y-2">
					<h3 className="text-lg font-semibold font-mono">
						Join the conversation
					</h3>
					<p className="text-muted-foreground text-sm font-mono">
						Sign in to like, comment, and connect with the community.
					</p>
				</div>
				<div className="flex flex-col gap-2 font-mono">
					<Link href="/login" className="w-full">
						<Button className="w-full">Log in</Button>
					</Link>
					<Link href="/signup" className="w-full">
						<Button variant="outline" className="w-full">
							Sign up
						</Button>
					</Link>
				</div>
			</div>
		</div>,
		document.body,
	);
}

export default function FeedClient({ initialPosts }: { initialPosts: Post[] }) {
	const router = useRouter();

	const [sidebarExpanded, setSidebarExpanded] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const [userData, setUserData] = useState<any | null>(null);
	const [postsData, setPostsData] = useState<Post[] | null>(initialPosts);

	const requestNotificationPermission = async (uid: string) => {
		if (!("Notification" in window)) return;
		try {
			const permission = await Notification.requestPermission();
			if (permission === "granted") {
				const messaging = getMessaging();
				const token = await getToken(messaging, {
					vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
				});
				console.log("Notification permission granted. FCM Token: ", token);

				await updateDoc(doc(db, "users", uid), {
					fcmToken: arrayUnion(token),
				});
			} else {
				console.log("Notification permission denied.");
			}
		} catch (error) {
			console.error("Error requesting notification permission:", error);
		}
	};

	useEffect(() => {
		const auth = getAuth();

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				// If we don't have initial posts for some reason, fetch them
				if (!postsData || postsData.length === 0) {
					try {
						const fallbackQuery = query(
							collection(db, "Posts"),
							orderBy("createdAt", "desc"),
							limit(20),
						);
						const fallbackSnap = await getDocs(fallbackQuery);
						const fetchedPosts = fallbackSnap.docs.map((doc) => ({
							id: doc.id,
							...doc.data(),
						})) as Post[];
						setPostsData(fetchedPosts);
					} catch (error) {
						setPostsData([]);
					}
				}
				return;
			}
			requestNotificationPermission(user.uid);

			const docRef = doc(db, "users", user.uid);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) {
				router.push("/onboarding/profile");
				return;
			}

			const userData = docSnap.data();
			setUserData(userData);
			const interests = userData?.interests || [];

			let fetchedPosts: Post[] = [];

			if (interests.length > 0) {
				const q = query(
					collection(db, "Posts"),
					where("tags", "array-contains-any", interests.slice(0, 10)),
					limit(50),
				);

				const snap = await getDocs(q);
				fetchedPosts = snap.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Post[];
			}

			if (fetchedPosts.length > 0) {
				fetchedPosts.sort((a, b) => {
					const aScore = (a.tags || []).filter((t: string) =>
						interests.includes(t),
					).length;
					const bScore = (b.tags || []).filter((t: string) =>
						interests.includes(t),
					).length;

					if (aScore === bScore) {
						return (
							((b.createdAt as any)?.seconds || 0) -
							((a.createdAt as any)?.seconds || 0)
						);
					}
					return bScore - aScore;
				});
			} else {
				const fallbackQuery = query(
					collection(db, "Posts"),
					orderBy("createdAt", "desc"),
					limit(20),
				);
				const fallbackSnap = await getDocs(fallbackQuery);

				fetchedPosts = fallbackSnap.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Post[];
			}

			setPostsData(fetchedPosts);
		});
		return () => unsubscribe();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768) {
				setMobileMenuOpen(false);
			}
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileMenuOpen]);

	const showSidebarText = sidebarExpanded || mobileMenuOpen;

	return (
		<div className="min-h-screen bg-background flex">
			{mobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 md:hidden"
					onClick={() => setMobileMenuOpen(false)}
				/>
			)}
			<aside
				className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border p-4 flex flex-col z-40 transition-all duration-300 ${
					sidebarExpanded ? "md:w-64" : "md:w-16"
				} w-64 ${
					mobileMenuOpen
						? "translate-x-0"
						: "-translate-x-full md:translate-x-0"
				}`}>
				<div className="flex items-center justify-between mb-8">
					<button
						onClick={() => setSidebarExpanded(!sidebarExpanded)}
						className={`hidden md:flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors ${
							sidebarExpanded ? "" : "w-full justify-center"
						}`}>
						<Menu className="w-5 h-5 text-foreground flex-shrink-0" />
						{sidebarExpanded && (
							<span className="font-mono text-xl font-bold text-foreground">
								IdeaMatcher_
							</span>
						)}
					</button>
					<div className="flex md:hidden items-center justify-between w-full">
						<span className="font-mono text-xl font-bold text-foreground">
							IdeaMatcher_
						</span>
						<button
							onClick={() => setMobileMenuOpen(false)}
							className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
							<X className="w-5 h-5 text-foreground" />
						</button>
					</div>
				</div>

				<nav className="flex-1 space-y-1">
					{navItems.map((item) => (
						<Link
							key={item.label}
							href={item.href}
							onClick={() => setMobileMenuOpen(false)}
							className={`flex items-center gap-3 px-3 py-3 rounded-lg font-mono text-sm transition-colors ${
								item.active
									? "bg-sidebar-accent text-foreground"
									: "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
							} ${!showSidebarText ? "justify-center" : ""}`}
							title={!showSidebarText ? item.label : undefined}>
							<item.icon className="w-5 h-5 flex-shrink-0" />
							{showSidebarText && (
								<span className="whitespace-nowrap">{item.label}</span>
							)}
						</Link>
					))}

					<div className="my-4 border-t border-sidebar-border" />

					{secondaryNavItems.map((item) => (
						<Link
							key={item.label}
							href={item.href}
							onClick={() => setMobileMenuOpen(false)}
							className={`flex items-center gap-3 px-3 py-3 rounded-lg font-mono text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors relative ${
								!showSidebarText ? "justify-center" : ""
							}`}
							title={!showSidebarText ? item.label : undefined}>
							<item.icon className="w-5 h-5 flex-shrink-0" />
							{showSidebarText && (
								<span className="whitespace-nowrap">{item.label}</span>
							)}
							{item.badge && (
								<span
									className={`w-2 h-2 bg-blue-500 rounded-full ${
										showSidebarText
											? "absolute right-3"
											: "absolute top-2 right-2"
									}`}
								/>
							)}
						</Link>
					))}
				</nav>

				<div className="pt-4 border-t border-sidebar-border">
					{userData ? (
						<Link
							href="/profile"
							className={`flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sidebar-accent transition-colors ${
								!showSidebarText ? "justify-center" : ""
							}`}
							title={!showSidebarText ? "Your Profile" : undefined}>
							<Avatar className="w-9 h-9 flex-shrink-0">
								<AvatarImage src={userData?.Avatar} />
								<AvatarFallback className="font-mono">
									{(userData?.Name ?? "")
										.split(" ")
										.filter(Boolean)
										.map((n: string) => n[0])
										.join("") || "IM"}
								</AvatarFallback>
							</Avatar>
							{showSidebarText && (
								<div className="flex-1 min-w-0">
									<p className="font-mono text-sm font-medium text-foreground truncate">
										{userData?.Name}
									</p>
									<p className="font-mono text-xs text-muted-foreground truncate">
										{userData?.username}
									</p>
								</div>
							)}
						</Link>
					) : (
						<Link
							href="/login"
							className={`flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sidebar-accent transition-colors ${
								!showSidebarText ? "justify-center" : ""
							}`}
							title={!showSidebarText ? "Log In" : undefined}>
							<LogIn className="w-5 h-5 flex-shrink-0" />
							{showSidebarText && (
								<span className="whitespace-nowrap">Log In</span>
							)}
						</Link>
					)}
				</div>
			</aside>

			<main
				className={`flex-1 min-w-0 transition-all duration-300 ${
					sidebarExpanded ? "md:ml-64" : "md:ml-16"
				} ml-0`}>
				{/* Top Header */}
				<header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between md:justify-center">
					<button
						className="md:hidden p-2 -ml-2 hover:bg-accent rounded-md"
						onClick={() => setMobileMenuOpen(true)}>
						<Menu className="w-5 h-5" />
					</button>
					<span className="font-mono text-xl font-bold text-foreground">
						IdeaMatcher_
					</span>
					<div className="w-9 md:hidden" />
				</header>

				{/* Feed */}
				<div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
					{
						<>
							{!userData && (
								<div className="mb-6 p-6 bg-card border border-border rounded-xl">
									<h1 className="text-xl font-semibold mb-2 text-foreground">
										Welcome to the Developer Community
									</h1>
									<p className="text-muted-foreground leading-relaxed mb-6">
										Browse ideas from developers around the world. This feed
										showcases the latest projects, hackathon teams, and
										collaboration opportunities. Log in to connect, collaborate,
										and bring your vision to life.
									</p>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-1">
											<h3 className="font-medium text-foreground">
												Find Teammates
											</h3>
											<p className="text-sm text-muted-foreground">
												Connect with skilled developers for your next hackathon
												or project.
											</p>
										</div>
										<div className="space-y-1">
											<h3 className="font-medium text-foreground">
												Share Ideas
											</h3>
											<p className="text-sm text-muted-foreground">
												Get feedback on your startup ideas and find early
												adopters.
											</p>
										</div>
										<div className="space-y-1">
											<h3 className="font-medium text-foreground">
												Showcase Projects
											</h3>
											<p className="text-sm text-muted-foreground">
												Display your portfolio and get discovered by the
												community.
											</p>
										</div>
										<div className="space-y-1">
											<h3 className="font-medium text-foreground">
												Join Discussions
											</h3>
											<p className="text-sm text-muted-foreground">
												Participate in technical discussions and share your
												knowledge.
											</p>
										</div>
									</div>
								</div>
							)}
							{postsData && postsData.length > 0 ? (
								postsData.map((post) => (
									<PostCard
										key={post.id}
										post={post}
										onDelete={(id) =>
											setPostsData((prev) =>
												prev ? prev.filter((p) => p.id !== id) : null,
											)
										}
										GuestLoginDialog={GuestLoginDialog}
									/>
								))
							) : (
								<div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
									<p className="text-lg font-medium">No posts yet</p>
									<p className="text-sm mt-1">
										Connect with others to see their ideas here.
									</p>
								</div>
							)}
						</>
					}
				</div>
			</main>
		</div>
	);
}
