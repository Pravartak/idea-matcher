"use client";

import Link from "next/link";
import {
	ArrowLeft,
	Settings,
	Share2,
	Briefcase,
	Users,
	Lightbulb,
	Code2,
	Server,
	Wrench,
	Plus,
} from "lucide-react";
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
		name: name || "Alex Rivera",
		bio: bio || "Full-stack developer passionate about building tools that help developers collaborate. Open source enthusiast. Always looking for interesting projects to work on.",
		profileImage: avatar || "/developer-avatar.png",
		posts: 42,
		followers: 1284,
		following: 567,
		connections: 234,
		projects: 12,
		hackathons: 5,
		skillMatches: 89,
		skills: {
			frontend: skills || ["React", "Next.js", "TypeScript", "Tailwind CSS"],
			backend: ["Node.js", "Python", "PostgreSQL", "MongoDB"],
			tools: ["Git", "Docker", "AWS", "Figma"],
		},
		interests: interests || ["Web Development", "Open Source", "AI/ML", "DevOps"],
		verified: true,
		currentlyWorkingOn: "AI-powered code review tool",
		lookingFor: "Hackathon teammates for upcoming events",
		availability: "10-15 hours/week",
		lookingForRoles: [
			"Frontend Developer",
			"UI/UX Designer",
			"DevOps Engineer",
		],
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

				{/* Developer Status/Availability */}
				<div className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<h3 className="mb-3 flex items-center gap-2 text-xs font-semibold sm:text-sm">
						<Briefcase className="h-4 w-4" />
						Developer Status
					</h3>
					<div className="space-y-2 text-xs sm:text-sm">
						<div>
							<span className="text-muted-foreground">
								Currently working on:
							</span>
							<p className="mt-1 text-foreground/90">
								{user.currentlyWorkingOn}
							</p>
						</div>
						<div>
							<span className="text-muted-foreground">Looking for:</span>
							<p className="mt-1 text-foreground/90">{user.lookingFor}</p>
						</div>
						<div>
							<span className="text-muted-foreground">Availability:</span>
							<span className="ml-2 text-foreground/90">
								{user.availability}
							</span>
						</div>
					</div>
				</div>

				{/* Developer-Focused Stats */}
				<div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-4 sm:gap-3">
					<div className="rounded-lg border border-border bg-card p-3 text-center">
						<div className="text-lg font-semibold sm:text-xl">
							{user.connections}
						</div>
						<div className="text-xs text-muted-foreground">Connections</div>
					</div>
					<div className="rounded-lg border border-border bg-card p-3 text-center">
						<div className="text-lg font-semibold sm:text-xl">
							{user.projects}
						</div>
						<div className="text-xs text-muted-foreground">Projects</div>
					</div>
					<div className="rounded-lg border border-border bg-card p-3 text-center">
						<div className="text-lg font-semibold sm:text-xl">
							{user.hackathons}
						</div>
						<div className="text-xs text-muted-foreground">Hackathons</div>
					</div>
					<div className="rounded-lg border border-border bg-card p-3 text-center">
						<div className="text-lg font-semibold sm:text-xl">
							{user.skillMatches}
						</div>
						<div className="text-xs text-muted-foreground">Skill Matches</div>
					</div>
				</div>

				{/* Skills */}
				<div className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<h3 className="mb-3 flex items-center gap-2 text-xs font-semibold sm:text-sm">
						<Code2 className="h-4 w-4" />
						Skills
					</h3>
					<div className="space-y-3">
						<div>
							<h4 className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
								<Code2 className="h-3.5 w-3.5" />
								Frontend
							</h4>
							<div className="flex flex-wrap gap-1.5 sm:gap-2">
								{user.skills.frontend.map((skill) => (
									<span
										key={skill}
										className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:px-3">
										{skill}
									</span>
								))}
							</div>
						</div>
						<div>
							<h4 className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
								<Server className="h-3.5 w-3.5" />
								Backend
							</h4>
							<div className="flex flex-wrap gap-1.5 sm:gap-2">
								{user.skills.backend.map((skill) => (
									<span
										key={skill}
										className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:px-3">
										{skill}
									</span>
								))}
							</div>
						</div>
						<div>
							<h4 className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
								<Wrench className="h-3.5 w-3.5" />
								Tools
							</h4>
							<div className="flex flex-wrap gap-1.5 sm:gap-2">
								{user.skills.tools.map((skill) => (
									<span
										key={skill}
										className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:px-3">
										{skill}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Interests */}
				<div className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<h3 className="mb-2 flex items-center gap-2 text-xs font-semibold sm:mb-3 sm:text-sm">
						<Lightbulb className="h-4 w-4" />
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

				{/* Looking For */}
				<div className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<h3 className="mb-2 flex items-center gap-2 text-xs font-semibold sm:mb-3 sm:text-sm">
						<Users className="h-4 w-4" />
						Looking to Connect With
					</h3>
					<div className="flex flex-wrap gap-1.5 sm:gap-2">
						{user.lookingForRoles.map((role) => (
							<span
								key={role}
								className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary sm:px-3">
								{role}
							</span>
						))}
					</div>
				</div>

				{/* User Posts Section Placeholder */}
				<div className="rounded-lg border border-border bg-card p-8 text-center sm:p-12">
					<div className="mx-auto max-w-sm">
						<div className="mb-4 flex justify-center">
							<div className="rounded-full bg-accent p-4">
								<Plus className="h-8 w-8 text-muted-foreground" />
							</div>
						</div>
						<h3 className="mb-2 text-sm font-semibold sm:text-base">
							No posts yet
						</h3>
						<p className="mb-4 text-xs text-muted-foreground sm:text-sm">
							Share what you're building, your ideas, or collaborate with other
							developers.
						</p>
						<Button className="bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90 sm:text-sm">
							Create your first post
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
}
