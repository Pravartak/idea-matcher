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
	Heart,
	MessageCircle,
	Share2,
	Bookmark,
	Play,
	Pause,
	Volume2,
	VolumeX,
	MoreHorizontal,
	ChevronLeft,
	ChevronRight,
	Menu,
	MessageSquare,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

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

interface PostMedia {
	type: "image" | "video" | "audio";
	url: string;
	alt?: string;
}

interface Post {
	id: string;
	author: {
		name: string;
		username: string;
		avatar: string;
		verified: boolean;
	};
	content: string;
	media?: PostMedia[];
	tags: string[];
	likes: number;
	comments: number;
	shares: number;
	timestamp: string;
	liked?: boolean;
	saved?: boolean;
}

const samplePosts: Post[] = [
	{
		id: "1",
		author: {
			name: "Avery Kim",
			username: "@averykim",
			avatar: "/developer-avatar-male.jpg",
			verified: true,
		},
		content:
			"Just shipped our MVP! Looking for a backend developer to help scale our infrastructure. We're building a collaborative coding platform for students. DM if interested!",
		media: [
			{
				type: "image",
				url: "/coding-dashboard-interface-dark.jpg",
				alt: "Project screenshot",
			},
		],
		tags: ["#WebDev", "#Startup", "#Hiring"],
		likes: 42,
		comments: 8,
		shares: 5,
		timestamp: "2h ago",
		liked: false,
		saved: false,
	},
	{
		id: "2",
		author: {
			name: "Devon Singh",
			username: "@devonsingh",
			avatar: "/developer-avatar-glasses.png",
			verified: true,
		},
		content:
			"Excited to announce our hackathon team is complete! We're building an AI-powered study assistant. Check out our demo video below.",
		media: [
			{
				type: "video",
				url: "/ai-study-assistant-demo-video-thumbnail.jpg",
			},
		],
		tags: ["#AI", "#Hackathon", "#EdTech"],
		likes: 89,
		comments: 15,
		shares: 23,
		timestamp: "4h ago",
		liked: true,
		saved: false,
	},
	{
		id: "3",
		author: {
			name: "Maya Lopez",
			username: "@mayalopez",
			avatar: "/creative-developer-avatar-female.jpg",
			verified: false,
		},
		content:
			"Working on some ambient music for focus sessions. Would love feedback from other developers on what helps you concentrate while coding!",
		media: [
			{
				type: "audio",
				url: "/audio-sample.mp3",
			},
		],
		tags: ["#Music", "#Productivity", "#DevLife"],
		likes: 156,
		comments: 34,
		shares: 12,
		timestamp: "6h ago",
		liked: false,
		saved: true,
	},
	{
		id: "4",
		author: {
			name: "Jordan Chen",
			username: "@jordanchen",
			avatar: "/tech-lead-avatar.png",
			verified: true,
		},
		content:
			"Our open source project just hit 1000 stars! Huge thanks to all contributors. Here are some highlights from our journey.",
		media: [
			{
				type: "image",
				url: "/github-stars-celebration-dark.jpg",
				alt: "GitHub milestone",
			},
			{
				type: "image",
				url: "/team-collaboration-coding.jpg",
				alt: "Team working",
			},
			{
				type: "image",
				url: "/code-review-interface-dark.jpg",
				alt: "Code review",
			},
		],
		tags: ["#OpenSource", "#Milestone", "#Community"],
		likes: 234,
		comments: 45,
		shares: 67,
		timestamp: "8h ago",
		liked: false,
		saved: false,
	},
];

function MediaCarousel({ media }: { media: PostMedia[] }) {
	const [currentIndex, setCurrentIndex] = useState(0);

	if (media.length === 1) {
		return <MediaItem media={media[0]} />;
	}

	return (
		<div className="relative">
			<MediaItem media={media[currentIndex]} />
			{media.length > 1 && (
				<>
					<button
						onClick={() =>
							setCurrentIndex((prev) =>
								prev > 0 ? prev - 1 : media.length - 1
							)
						}
						className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors">
						<ChevronLeft className="w-5 h-5" />
					</button>
					<button
						onClick={() =>
							setCurrentIndex((prev) =>
								prev < media.length - 1 ? prev + 1 : 0
							)
						}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors">
						<ChevronRight className="w-5 h-5" />
					</button>
					<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
						{media.map((_, idx) => (
							<span
								key={idx}
								className={`w-2 h-2 rounded-full transition-colors ${
									idx === currentIndex ? "bg-primary" : "bg-muted-foreground/50"
								}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}

function MediaItem({ media }: { media: PostMedia }) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(true);

	if (media.type === "image") {
		return (
			<img
				src={media.url || "/placeholder.svg"}
				alt={media.alt || "Post image"}
				className="w-full h-auto rounded-lg object-cover max-h-96"
			/>
		);
	}

	if (media.type === "video") {
		return (
			<div className="relative rounded-lg overflow-hidden bg-secondary">
				<img
					src={media.url || "/placeholder.svg"}
					alt="Video thumbnail"
					className="w-full h-auto object-cover max-h-96"
				/>
				<div className="absolute inset-0 flex items-center justify-center">
					<button
						onClick={() => setIsPlaying(!isPlaying)}
						className="p-4 bg-primary/90 rounded-full hover:bg-primary transition-colors">
						{isPlaying ? (
							<Pause className="w-6 h-6" />
						) : (
							<Play className="w-6 h-6 ml-1" />
						)}
					</button>
				</div>
				<button
					onClick={() => setIsMuted(!isMuted)}
					className="absolute bottom-3 right-3 p-2 bg-background/80 rounded-full hover:bg-background transition-colors">
					{isMuted ? (
						<VolumeX className="w-4 h-4" />
					) : (
						<Volume2 className="w-4 h-4" />
					)}
				</button>
			</div>
		);
	}

	if (media.type === "audio") {
		return (
			<div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
				<button
					onClick={() => setIsPlaying(!isPlaying)}
					className="p-3 bg-primary rounded-full hover:bg-primary/80 transition-colors">
					{isPlaying ? (
						<Pause className="w-5 h-5" />
					) : (
						<Play className="w-5 h-5 ml-0.5" />
					)}
				</button>
				<div className="flex-1">
					<div className="h-1 bg-muted rounded-full overflow-hidden">
						<div className="h-full w-1/3 bg-primary rounded-full" />
					</div>
					<div className="flex justify-between mt-1 font-mono text-xs text-muted-foreground">
						<span>1:24</span>
						<span>3:45</span>
					</div>
				</div>
				<button
					onClick={() => setIsMuted(!isMuted)}
					className="p-2 hover:bg-muted rounded-full transition-colors">
					{isMuted ? (
						<VolumeX className="w-4 h-4" />
					) : (
						<Volume2 className="w-4 h-4" />
					)}
				</button>
			</div>
		);
	}

	return null;
}

function PostCard({ post }: { post: Post }) {
	const [liked, setLiked] = useState(post.liked);
	const [saved, setSaved] = useState(post.saved);
	const [likeCount, setLikeCount] = useState(post.likes);

	const handleLike = () => {
		setLiked(!liked);
		setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
	};

	return (
		<article className="bg-card border border-border rounded-xl p-5">
			{/* Post Header */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<Avatar className="w-11 h-11">
						<AvatarImage
							src={post.author.avatar || "/placeholder.svg"}
							alt={post.author.name}
						/>
						<AvatarFallback className="font-mono">
							{post.author.name[0]}
						</AvatarFallback>
					</Avatar>
					<div>
						<div className="flex items-center gap-2">
							<span className="font-mono font-medium text-foreground">
								{post.author.name}
							</span>
							{post.author.verified && (
								<span className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs font-mono rounded">
									Verified
								</span>
							)}
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
							<span>{post.author.username}</span>
							<span>·</span>
							<span>{post.timestamp}</span>
						</div>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="text-muted-foreground hover:text-foreground">
					<MoreHorizontal className="w-5 h-5" />
				</Button>
			</div>

			{/* Post Content */}
			<p className="font-mono text-sm text-foreground leading-relaxed mb-4">
				{post.content}
			</p>

			{/* Media */}
			{post.media && post.media.length > 0 && (
				<div className="mb-4">
					<MediaCarousel media={post.media} />
				</div>
			)}

			{/* Tags */}
			<div className="flex flex-wrap gap-2 mb-4">
				{post.tags.map((tag) => (
					<span
						key={tag}
						className="px-2 py-1 bg-secondary text-muted-foreground text-xs font-mono rounded hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
						{tag}
					</span>
				))}
			</div>

			{/* Actions */}
			<div className="flex items-center justify-between pt-3 border-t border-border">
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleLike}
						className={`gap-2 font-mono text-xs ${
							liked
								? "text-red-500 hover:text-red-400"
								: "text-muted-foreground hover:text-foreground"
						}`}>
						<Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
						{likeCount}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="gap-2 font-mono text-xs text-muted-foreground hover:text-foreground">
						<MessageCircle className="w-4 h-4" />
						{post.comments}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="gap-2 font-mono text-xs text-muted-foreground hover:text-foreground">
						<Share2 className="w-4 h-4" />
						{post.shares}
					</Button>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setSaved(!saved)}
					className={`${
						saved
							? "text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}>
					<Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
				</Button>
			</div>
		</article>
	);
}

export default function FeedPage() {
	const [sidebarExpanded, setSidebarExpanded] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem("username");
			setUsername(stored);
		}
	}, []);
	const [avatar, setAvatar] = useState<string | null>(null);
	const [name, setName] = useState<string | null>(null);

	useEffect(() => {
		if (!username) return;

		async function fetchData() {
			const docRef = username ? doc(db, "users", username) : null;
			const docSnap = docRef ? await getDoc(docRef) : null;

			if (docSnap && docSnap.exists()) {
				setAvatar(docSnap.get("Avatar"));
				setName(docSnap.get("Name"));
			}
		}

		fetchData();
	}, [username]);

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
					mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
					<Link
						href="/profile"
						className={`flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sidebar-accent transition-colors ${
							!showSidebarText ? "justify-center" : ""
						}`}
						title={!showSidebarText ? "Your Profile" : undefined}>
						<Avatar className="w-9 h-9 flex-shrink-0">
							<AvatarImage src={avatar ? avatar : "/user-profile-avatar.png"} />
							<AvatarFallback className="font-mono">U</AvatarFallback>
						</Avatar>
						{showSidebarText && (
							<div className="flex-1 min-w-0">
								<p className="font-mono text-sm font-medium text-foreground truncate">
									{name || "Your Name"}
								</p>
								<p className="font-mono text-xs text-muted-foreground truncate">
									@{username || "username"}
								</p>
							</div>
						)}
					</Link>
				</div>
			</aside>

			<main
				className={`flex-1 transition-all duration-300 ${
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
					{samplePosts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			</main>
		</div>
	);
}
