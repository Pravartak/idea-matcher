"use client";

import type React from "react";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useRef, useEffect, useState } from "react";

const DOMAINS = [
	"Web Developer",
	"Mobile Developer",
	"Game Developer",
	"Data Scientist",
	"UI/UX Designer",
	"AI/ML Engineer",
	"DevOps/Cloud Engineer",
	"Emmbedded IoT",
	"Student/Learner",
	"Other",
];

export default function ProfileSetupPage() {
	const router = useRouter();
	const auth = getAuth();
	const fileRef = useRef<HTMLInputElement>(null);
	const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null;
	const user = userData ? JSON.parse(userData) : null;
	const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
	const [email, setEmail] = useState<string | null>(null);
	const [loadingAuth, setLoadingAuth] = useState(true);
	const [mounted, setMounted] = useState(false);

	const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.photoURL || null);
	const [name, setName] = useState(user?.displayName || "");
	const [username, setUsername] = useState("");
	const [bio, setBio] = useState("");
	const [domain, setDomain] = useState<string>("");
	const [github, setGithub] = useState("");
	const [portfolio, setPortfolio] = useState("");

	const MAX_BIO = 200;

	useEffect(() => {
		setMounted(true);
	}, []);

	function onFileChange(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = URL.createObjectURL(file);
		setAvatarUrl(url);
	}

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (!user) {
				router.push("/signup");
				return;
			}

			setFirebaseUid(user.uid);
			setEmail(user.email);
			setLoadingAuth(false);
		});

		return () => unsubscribe();
	}, []);

	async function handleContinue() {
		if (!username.trim() || !bio.trim() || !domain || !name.trim()) {
			alert(
				"Please fill out all required fields: Name, Username, Bio, and Domain."
			);
			return;
		} else {
			const specialChars = /^[a-zA-Z0-9_]{3,20}$/;
			if (!specialChars.test(username)) {
				alert("Username can only contain letters, numbers, and underscores.");
				return;
			}

			const usernameRef = doc(db, "usernames", username);
			const usernameSnap = await getDoc(usernameRef);

			if (usernameSnap.exists()) {
				alert("Username already taken. Please choose another one.");
				return;
			} else {
				if (!firebaseUid) return;
				localStorage.setItem("username", username);
				await setDoc(doc(db, "users", firebaseUid), {
					uid: firebaseUid,
					username: username,
					Name: name,
					Email: email,
					Avatar: avatarUrl || "",
					Bio: bio,
					Posts: 0,
					Followers: 0,
					Following: 0,
					Connections: 0,
					Projects: 0,
					Hackathons: 0,
					Domain: domain,
					Github: github,
					Portfolio: portfolio,
					currentlyWorkingOn: "Nothing yet!",
					lookingFor: "Nothing yet!",
					lookingToConnectWith: [],
					Verified: false,
					createdAt: new Date().toISOString(),
				}, { merge: true });
				await setDoc(doc(db, "usernames", username), {
					firebaseUid: firebaseUid,
				});
			}
			router.push("/onboarding/interests");
		}
	}

	return (
		<main className="min-h-dvh bg-background text-foreground">
			{/* Top bar */}
			<header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto w-full max-w-3xl px-4 py-3 flex items-center justify-between">
					<Link href="#" className="font-mono text-sm md:text-base">
						<span className="font-semibold">IdeaMatcher_</span>
					</Link>
					<div className="text-xs md:text-sm text-muted-foreground">
						Step 1 of 3
					</div>
				</div>
			</header>

			<section className="mx-auto w-full max-w-3xl px-4 py-10 md:py-12">
				<div className="space-y-2">
					<h1 className="text-2xl md:text-3xl font-semibold text-pretty">
						Set Up Your Profile
					</h1>
					<p className="text-sm text-muted-foreground">
						This helps others know who you are.
					</p>
				</div>

				{/* Avatar uploader */}
				<div className="mt-8 flex flex-col md:flex-row items-center gap-4 md:gap-6">
					<div className="size-24 md:size-28 rounded-full overflow-hidden border border-border bg-card flex items-center justify-center">
						{/* Note: using next/image for optimization; fallback to <img> if necessary. */}
						<Image
							src={mounted ? avatarUrl ?? "/placeholder.svg" : "/placeholder.svg"}
							alt="Profile preview"
							width={96}
							height={96}
							className="h-full w-full object-cover"
							unoptimized
						/>
					</div>
					<div className="flex items-center gap-2">
						<input
							ref={fileRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={onFileChange}
						/>
						<Button onClick={() => fileRef.current?.click()}>
							Upload Photo
						</Button>
					</div>
				</div>

				{/* Name */}
				<div className="mt-6 md:mt-8">
					<label
						htmlFor="name"
						className="mb-2 block text-sm text-muted-foreground">
						Full Name
					</label>
					<Input
						id="name"
						type="text"
						placeholder="Your Name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="bg-background border-border focus-visible:ring-1 focus-visible:ring-foreground"
						required
					/>
				</div>

				{/* Username */}
				<div className="mt-4 md:mt-6">
					<label
						htmlFor="username"
						className="mb-2 block text-sm text-muted-foreground">
						Username (UID)
					</label>
					<Input
						id="username"
						type="text"
						placeholder="your-unique-id"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="bg-background border-border focus-visible:ring-1 focus-visible:ring-foreground"
						required
					/>
				</div>

				{/* Bio */}
				<div className="mt-6">
					<label className="mb-2 block text-sm text-muted-foreground">
						Short Bio
					</label>
					<div className="relative">
						<textarea
							value={bio}
							onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
							placeholder="e.g. Fullstack dev who loves hackathons and building real stuff."
							rows={5}
							className={cn(
								"w-full resize-none rounded-md border bg-background p-3 text-sm",
								"border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
							)}
						/>
						<div className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground">
							{bio.length}/{MAX_BIO}
						</div>
					</div>
				</div>

				{/* Role */}
				<div className="mt-6">
					<label className="mb-2 block text-sm text-muted-foreground">
						What best describes you?
					</label>
					<select
						value={domain}
						onChange={(e) => setDomain(e.target.value)}
						className={cn(
							"w-full rounded-md border bg-background p-2.5 text-sm",
							"border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
						)}>
						<option value="">Select a domain</option>
						{DOMAINS.map((r) => (
							<option key={r} value={r}>
								{r}
							</option>
						))}
					</select>
				</div>

				{/* Social links */}
				<div className="mt-6 grid gap-4 md:grid-cols-2">
					<div className="flex flex-col gap-2">
						<label className="text-sm text-muted-foreground">
							GitHub URL (optional)
						</label>
						<Input
							type="url"
							placeholder="https://github.com/username"
							value={github}
							onChange={(e) => setGithub(e.target.value)}
							className="bg-background border-border focus-visible:ring-1 focus-visible:ring-foreground"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-sm text-muted-foreground">
							Portfolio/LinkedIn (optional)
						</label>
						<Input
							type="url"
							placeholder="https://yourportfolio.com"
							value={portfolio}
							onChange={(e) => setPortfolio(e.target.value)}
							className="bg-background border-border focus-visible:ring-1 focus-visible:ring-foreground"
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="mt-10 flex items-center justify-end">
					<div className="flex items-center gap-2">
						<Button onClick={handleContinue}>Continue</Button>
					</div>
				</div>
			</section>
		</main>
	);
}
