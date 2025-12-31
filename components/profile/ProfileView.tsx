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
	Edit2,
	Check,
	Heart,
	MessageSquare,
	UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ProfileViewProps } from "../types/users";
import { db } from "@/lib/firebase";
import { updateDoc, doc } from "firebase/firestore";

export default function ProfilePage({
	user,
	userid,
	isOwner,
}: ProfileViewProps) {
	const [isEditingLookingFor, setIsEditingLookingFor] = useState(false);
	const [selectedRoles, setSelectedRoles] = useState([
		"Frontend Developer",
		"UI/UX Designer",
		"DevOps Engineer",
	]);
	const ALL_ROLES = [
		"Frontend Developer",
		"Backend Developer",
		"Fullstack Developer",
		"UI/UX Designer",
		"Product Manager",
		"DevOps Engineer",
		"Data Scientist",
		"Mobile Developer",
		"QA Engineer",
		"Project Manager",
		"Researcher",
		"Entrepreneur",
		"Student",
		"Other",
	];

	const [isConnected, setIsConnected] = useState(false);
	const [isFollowing, setIsFollowing] = useState(false);

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: `${user.Name} (@${userid}) - IdeaMatcher`,
				text: user.Bio,
				url: `${window.location.origin}/u/${userid}`,
			});
		} else {
			navigator.clipboard.writeText(`${window.location.origin}/u/${userid}`);
			alert("Profile link copied to clipboard!");
		}
	};

	const toggleRole = (role: string) => {
		setSelectedRoles((prev) =>
			prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
		);
	};

	const handleSave = async () => {
		if (!userid) return;
		await updateDoc(doc(db, "users", userid), {
			lookingToConnectWith: selectedRoles,
		});
		setIsEditingLookingFor(false);
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
					<h1 className="text-sm font-medium sm:text-base">@{userid}</h1>
					{isOwner ? (
						<Link
							href="/settings"
							className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent sm:h-9 sm:w-9">
							<Settings className="h-4 w-4 sm:h-5 sm:w-5" />
						</Link>
					) : (
						<button
							onClick={handleShare}
							className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent sm:h-9 sm:w-9">
							<Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
						</button>
					)}
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
								src={user.Avatar || "/placeholder.svg"}
								alt={user.Name}
							/>
							<AvatarFallback className="text-xl sm:text-2xl">
								{(user.Name ?? "")
									.split(" ")
									.filter(Boolean)
									.map((n) => n[0])
									.join("") || "?"}
							</AvatarFallback>
						</Avatar>

						{/* Stats and Name */}
						<div className="flex-1">
							<h2 className="mb-2 text-lg font-semibold sm:text-xl">
								{user.Name}
							</h2>
							<div className="flex gap-4 text-xs sm:gap-6 sm:text-sm">
								<div>
									<span className="font-semibold">{user.Posts}</span>
									<span className="ml-1 text-muted-foreground">posts</span>
								</div>
								<div>
									<span className="font-semibold">{user.Followers}</span>
									<span className="ml-1 text-muted-foreground">followers</span>
								</div>
								<div>
									<span className="font-semibold">{user.Following}</span>
									<span className="ml-1 text-muted-foreground">following</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Bio */}
				<div className="mb-4 sm:mb-6">
					<p className="text-xs leading-relaxed text-foreground/90 sm:text-sm">
						{user.Bio}
					</p>
				</div>

				{/* Action Buttons */}
				{isOwner ? (
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
				) : (
					<div className="mb-6 flex flex-col gap-2 xs:flex-row xs:gap-3 sm:mb-8">
						<Button
							onClick={() => setIsConnected(!isConnected)}
							className={`flex-1 text-xs font-medium sm:text-sm ${
								isConnected
									? "bg-accent text-accent-foreground hover:bg-accent/80"
									: "bg-primary text-primary-foreground hover:bg-primary/90"
							}`}>
							<UserPlus className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
							{isConnected ? "Connected" : "Connect"}
						</Button>
						<Button
							onClick={() => setIsFollowing(!isFollowing)}
							variant={isFollowing ? "outline" : "default"}
							className={`flex-1 text-xs font-medium sm:text-sm ${
								isFollowing
									? "border-border bg-transparent hover:bg-accent"
									: ""
							}`}>
							<Heart
								className={`mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 ${
									isFollowing ? "fill-primary" : ""
								}`}
							/>
							{isFollowing ? "Following" : "Follow"}
						</Button>
						<Button
							asChild
							variant="outline"
							className="flex-1 border-border bg-transparent text-xs font-medium hover:bg-accent sm:text-sm">
							<Link href={`/chat/${userid}`}>
								<MessageSquare className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
								Message
							</Link>
						</Button>
					</div>
				)}

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
					</div>
				</div>

				{/* Developer-Focused Stats */}
				<div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-4 sm:gap-3">
					<div className="rounded-lg border border-border bg-card p-3 text-center">
						<div className="text-lg font-semibold sm:text-xl">
							{user.Connections}
						</div>
						<div className="text-xs text-muted-foreground">Connections</div>
					</div>
					<div className="rounded-lg border border-border bg-card p-3 text-center">
						<div className="text-lg font-semibold sm:text-xl">
							{user.Projects}
						</div>
						<div className="text-xs text-muted-foreground">Projects</div>
					</div>
					<div className="rounded-lg border border-border bg-card p-3 text-center">
						<div className="text-lg font-semibold sm:text-xl">
							{user.Hackathons}
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
							{/* <h4 className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Code2 className="h-3.5 w-3.5" />
                Frontend
              </h4> */}
							<div className="flex flex-wrap gap-1.5 sm:gap-2">
								{user.skills?.map((skill) => (
									<span
										key={skill}
										className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:px-3">
										{skill}
									</span>
								))}
							</div>
						</div>
						{/* <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Server className="h-3.5 w-3.5" />
                Backend
              </h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {user.skills?.backend?.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:px-3"
                  >
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
                {user.skills?.tools?.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:px-3"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div> */}
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

				<div className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<div className="mb-3 flex items-center justify-between sm:mb-4">
						<h3 className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
							<Users className="h-4 w-4" />
							Looking to Connect With
						</h3>
						{isOwner && !isEditingLookingFor ? (
							<button
								onClick={() => setIsEditingLookingFor(!isEditingLookingFor)}
								className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 sm:px-2.5 sm:py-2">
								<>
									<Edit2 className="h-3.5 w-3.5" />
									Edit
								</>
							</button>
						) : null}
					</div>

					{isEditingLookingFor ? (
						<div className="space-y-2">
							<p className="text-xs text-muted-foreground sm:text-sm">
								Select roles you're looking to connect with:
							</p>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
								{ALL_ROLES.map((role) => (
									<label
										key={role}
										className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 cursor-pointer transition-colors hover:bg-card/80">
										<input
											type="checkbox"
											checked={selectedRoles.includes(role)}
											onChange={() => toggleRole(role)}
											className="h-4 w-4 cursor-pointer"
										/>
										<span className="text-xs sm:text-sm">{role}</span>
									</label>
								))}
							</div>
							<button
								onClick={handleSave}
								className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:py-2.5">
								Save Changes
							</button>
						</div>
					) : (
						<div className="flex flex-wrap gap-1.5 sm:gap-2">
							{selectedRoles.map((role) => (
								<span
									key={role}
									className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary sm:px-3">
									{role}
								</span>
							))}
						</div>
					)}
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
