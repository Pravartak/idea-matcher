"use client";

import Link from "next/link";
import { ArrowLeft, Settings, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function ProfilePage() {
    const router = useRouter();

	const [username, setUsername] = useState<string | null>(null);
	const [avatar, setAvatar] = useState<string | null>(null);
	const [name, setName] = useState<string | null>(null);
    const [bio, setBio] = useState<string | null>(null);
    const [skills, setSkills] = useState<string[] | null>(null);
    const [interests, setInterests] = useState<string[] | null>(null);

	const [, setLoadingUser] = useState(true);

	useEffect(() => {
		const auth = getAuth();

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				router.push("/signup");
				return;
			}

			async function loadUser() {
				const q = query(
					collection(db, "users"),
					where("firebaseUid", "==", auth.currentUser?.uid)
				);

				const snap = await getDocs(q);

				if (snap.empty) {
					router.push("/onboarding/profile");
					return;
				}
				const docSnap = snap.docs[0];

				setUsername(docSnap.id);
				setAvatar(docSnap.get("Avatar"));
				setName(docSnap.get("Name"));
                setBio(docSnap.get("Bio"));
                setSkills(docSnap.get("skills"));
                setInterests(docSnap.get("interests"));
				setLoadingUser(false);

				localStorage.setItem("username", docSnap.id);
			}
			loadUser();
		});
		return () => unsubscribe();
	}, []);

	// Mock user data
	const user = {
		username: username || "idea_matcher_user",
		name: name || "Idea Matcher User",
		bio: bio || "Couldn't load you data...",
		profileImage: avatar || "/developer-avatar.png",
		posts: 0,
		followers: 10000,
		following: 1,
		skills: skills || ["React", "Node.js", "TypeScript", "Python", "PostgreSQL"],
		interests: interests || ["Web Development", "Open Source", "AI/ML", "DevOps"],
		verified: true,
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: `${user.name} (@${user.username}) - IdeaMatcher`,
				text: user.bio,
				url: window.location.href,
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
			alert("Profile link copied to clipboard!");
		}
	};

	return (
		<div className="min-h-screen bg-background font-mono">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
				<div className="flex items-center justify-between px-3 py-3 sm:px-4">
					<Link
						href="/home"
						className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent sm:h-9 sm:w-9">
						<ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
					</Link>
					<h1 className="text-sm font-medium sm:text-base">@{user.username}</h1>
					<Link
						href="/settings"
						className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent sm:h-9 sm:w-9">
						<Settings className="h-4 w-4 sm:h-5 sm:w-5" />
					</Link>
				</div>
			</header>

			{/* Profile Content */}
			<main className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
				{/* Profile Info */}
				<div className="mb-4 sm:mb-6">
					<div className="mb-4 flex items-start gap-4">
						{/* Profile Photo */}
						<Avatar className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32">
							<AvatarImage
								src={user.profileImage || "/placeholder.svg"}
								alt={user.name}
							/>
							<AvatarFallback className="text-xl sm:text-2xl">
								{user.name
									.split(" ")
									.map((n) => n[0])
									.join("")}
							</AvatarFallback>
						</Avatar>

						{/* Stats and Name */}
						<div className="flex-1">
							<h2 className="mb-2 text-lg font-semibold sm:text-xl">
								{user.name}
							</h2>
							<div className="flex gap-4 text-xs sm:gap-6 sm:text-sm">
								<div>
									<span className="font-semibold">{user.posts}</span>
									<span className="ml-1 text-muted-foreground">posts</span>
								</div>
								<div>
									<span className="font-semibold">{user.followers}</span>
									<span className="ml-1 text-muted-foreground">followers</span>
								</div>
								<div>
									<span className="font-semibold">{user.following}</span>
									<span className="ml-1 text-muted-foreground">following</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Bio */}
				<div className="mb-4 sm:mb-6">
					<p className="text-xs leading-relaxed text-foreground/90 sm:text-sm">
						{user.bio}
					</p>
				</div>

				{/* Action Buttons */}
				<div className="mb-6 flex flex-col gap-2 xs:flex-row xs:gap-3 sm:mb-8">
					<Button
						asChild
						className="flex-1 bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90 sm:text-sm">
						<Link href="/edit-profile">Edit Profile</Link>
					</Button>
					<Button
						onClick={handleShare}
						variant="outline"
						className="flex-1 border-border bg-transparent text-xs font-medium hover:bg-accent sm:text-sm">
						<Share2 className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
						Share Profile
					</Button>
				</div>

				{/* Skills */}
				<div className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<h3 className="mb-2 text-xs font-semibold sm:mb-3 sm:text-sm">
						Skills
					</h3>
					<div className="flex flex-wrap gap-1.5 sm:gap-2">
						{user.skills.map((skill) => (
							<span
								key={skill}
								className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:px-3">
								{skill}
							</span>
						))}
					</div>
				</div>

				{/* Interests */}
				<div className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<h3 className="mb-2 text-xs font-semibold sm:mb-3 sm:text-sm">
						Interests
					</h3>
					<div className="flex flex-wrap gap-1.5 sm:gap-2">
						{user.interests.map((interest) => (
							<span
								key={interest}
								className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:px-3">
								{interest}
							</span>
						))}
					</div>
				</div>

				{/* User Posts Section Placeholder */}
				<div className="rounded-lg border border-border bg-card p-6 text-center sm:p-8">
					<p className="text-xs text-muted-foreground sm:text-sm">
						Posts will appear here
					</p>
				</div>
			</main>
		</div>
	);
}
