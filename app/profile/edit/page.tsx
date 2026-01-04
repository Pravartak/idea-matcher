"use client";

import Link from "next/link";
import {
	ArrowLeft,
	Upload,
	Code2,
	Server,
	Wrench,
	Lightbulb,
	Briefcase,
	Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const SKILL_OPTIONS = {
	Languages: [
		"HTML",
		"CSS",
		"JavaScript",
		"TypeScript",
		"Python",
		"Java",
		"C",
		"C++",
		"C#",
		"Ruby",
		"PHP",
		"Swift",
		"Kotlin",
		"Rust",
		"Go",
	],
	Frameworks: [
		"React",
		"Next.js",
		"Vue.js",
		"Angular",
		"Node.js",
		"Express",
		"Django",
		"Flask",
		"Spring Boot",
		"Ruby on Rails",
		"Laravel",
		"ASP.NET",
		"Flutter",
	],
	Platforms: [
		"AWS",
		"Azure",
		"Google Cloud",
		"Firebase",
		"Netlify",
		"Vercel",
		"Docker",
		"Android",
		"iOS",
	],
	Tools: [
		"Git",
		"GitHub",
		"GitLab",
		"Figma",
		"VS Code",
		"Docker",
		"Webpack",
		"Vitest",
		"Jest",
		"ESLint",
		"Prettier",
		"Postman",
	],
};

const INTEREST_OPTIONS = [
	"Web Development",
	"Backend Engineering",
	"DevOps",
	"AI/ML",
	"Cybersecurity",
	"Hackathons",
	"Open Source",
	"Game Dev",
	"UI/UX",
	"Cloud Computing",
	"Startups",
	"Compilers",
	"App Development",
	"Blockchain",
	"Data Science",
	"Competitive Programming",
];

const ROLE_OPTIONS = [
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
];

export default function EditProfilePage() {
	const [lastUsernameChange, setLastUsernameChange] = useState<number | null>(
		null
	);
	const [usernameChangeable, setUsernameChangeable] = useState(true);
	const [nextChangeDate, setNextChangeDate] = useState<Date | null>(null);
	const [userData, setUserData] = useState<any | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const router = useRouter();

	const [formData, setFormData] = useState({
		Name: "Alex Rivera",
		username: "alex_dev",
		Bio: "Full-stack developer passionate about building tools that help developers collaborate. Open source enthusiast. Always looking for interesting projects to work on.",
		Avatar: "/developer-avatar.png",
		currentlyWorkingOn: "AI-powered code review tool",
		lookingFor: "Hackathon teammates for upcoming events",
		Skills: {
			Languages: ["JavaScript", "Python", "TypeScript", "Java"],
			Frameworks: ["React", "Next.js", "Node.js", "Django"],
			Platforms: ["AWS", "Google Cloud", "Vercel", "Docker"],
			Tools: ["Git", "Docker", "Figma", "VS Code"],
		},
		interests: ["Web Development", "Open Source", "AI/ML", "DevOps"],
		lookingToConnectWith: [
			"Frontend Developer",
			"Backend Developer",
			"DevOps Engineer",
		],
	});

	useEffect(() => {
		const auth = getAuth();

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				router.push("/signup");
				return;
			}

			const docRef = doc(db, "users", user.uid);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) {
				router.push("/onboarding/profile");
				return;
			}

			setUserId(user.uid);
			setUserData(docSnap.data());
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (!userData) return;

		setFormData({
			Name: userData.Name ?? "Alex Rivera",
			username: userData.username ?? "alex_dev",
			Bio: userData.Bio ?? "",
			Avatar: userData.Avatar ?? "/developer-avatar.png",
			currentlyWorkingOn: userData.currentlyWorkingOn ?? "",
			lookingFor: userData.lookingFor ?? "",
			Skills: userData.Skills ?? {
				Languages: [],
				Frameworks: [],
				Platforms: [],
				Tools: [],
			},
			interests: userData.interests ?? [],
			lookingToConnectWith: userData.lookingToConnectWith ?? [],
		});
	}, [userData]);

	useEffect(() => {
		const storedLastChange = localStorage.getItem("lastUsernameChange");
		if (storedLastChange) {
			const lastChangeTime = new Date(storedLastChange);
			const nextAllowedChange = new Date(
				lastChangeTime.getTime() + 30 * 24 * 60 * 60 * 1000
			); // 30 days
			const now = new Date();

			if (now < nextAllowedChange) {
				setUsernameChangeable(false);
				setNextChangeDate(nextAllowedChange);
				setLastUsernameChange(lastChangeTime.getTime());
			} else {
				setUsernameChangeable(true);
				setLastUsernameChange(lastChangeTime.getTime());
			}
		} else {
			setUsernameChangeable(true);
		}
	}, []);

	const getDaysRemaining = () => {
		if (!nextChangeDate) return 0;
		const now = new Date();
		const daysMs = nextChangeDate.getTime() - now.getTime();
		return Math.ceil(daysMs / (1000 * 60 * 60 * 24));
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const toggleSkill = (category: keyof typeof SKILL_OPTIONS, skill: string) => {
		setFormData((prev) => ({
			...prev,
			Skills: {
				...prev.Skills,
				[category]: prev.Skills[category].includes(skill)
					? prev.Skills[category].filter((s) => s !== skill)
					: [...prev.Skills[category], skill],
			},
		}));
	};

	const toggleInterest = (interest: string) => {
		setFormData((prev) => ({
			...prev,
			interests: prev.interests.includes(interest)
				? prev.interests.filter((i) => i !== interest)
				: [...prev.interests, interest],
		}));
	};

	const toggleRole = (role: string) => {
		setFormData((prev) => ({
			...prev,
			lookingToConnectWith: prev.lookingToConnectWith.includes(role)
				? prev.lookingToConnectWith.filter((r) => r !== role)
				: [...prev.lookingToConnectWith, role],
		}));
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Limit file size to 500KB for database storage to avoid hitting document limits
		if (file.size > 500 * 1024) {
			alert("Please upload an image smaller than 500KB.");
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			setFormData((prev) => ({ ...prev, Avatar: reader.result as string }));
		};
		reader.readAsDataURL(file);
	};

	const handleSave = async () => {
		if (usernameChangeable && formData.username !== "alex_dev") {
			localStorage.setItem("lastUsernameChange", new Date().toISOString());
		}
		await updateDoc(doc(db, "users", userId!), formData);
		console.log("Profile updated:", formData);
		// Save to database
		router.push("/profile");
	};

	return (
		<div className="min-h-screen bg-background font-mono">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
				<div className="flex items-center justify-between px-3 py-3 sm:px-4">
					<Link
						href="/profile"
						className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent sm:h-9 sm:w-9">
						<ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
					</Link>
					<h1 className="text-sm font-medium sm:text-base">Edit Profile</h1>
					<div className="h-8 w-8 sm:h-9 sm:w-9"></div>
				</div>
			</header>

			{/* Form Content */}
			<main className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
				{/* Profile Photo Upload */}
				<div className="mb-6 rounded-lg border border-border bg-card p-4 sm:p-6">
					<h2 className="mb-4 text-sm font-semibold sm:text-base">
						Profile Photo
					</h2>
					<div className="flex flex-col items-center gap-4 sm:flex-row">
						<Avatar className="h-24 w-24 sm:h-28 sm:w-28">
							<AvatarImage
								src={formData.Avatar || "/placeholder.svg"}
								alt={formData.Name}
							/>
							<AvatarFallback>
								{formData.Name.split(" ")
									.map((n: string) => n[0])
									.join("")}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col gap-2">
							<label className="flex h-10 w-fit cursor-pointer items-center justify-center rounded-md border border-border bg-accent/20 px-4 text-xs font-medium transition-colors hover:bg-accent/30 sm:h-11 sm:text-sm">
								<Upload className="mr-2 h-4 w-4" />
								Upload Photo
								<input
									type="file"
									className="hidden"
									accept="image/*"
									onChange={handleImageUpload}
								/>
							</label>
							<p className="text-xs text-muted-foreground">
								JPG, PNG or GIF (max 5MB)
							</p>
						</div>
					</div>
				</div>

				{/* Basic Info */}
				<div className="mb-6 rounded-lg border border-border bg-card p-4 sm:p-6">
					<h2 className="mb-4 text-sm font-semibold sm:text-base">
						Basic Information
					</h2>
					<div className="space-y-4">
						<div>
							<label className="mb-2 block text-xs font-medium sm:text-sm">
								Name
							</label>
							<Input
								name="Name"
								value={formData.Name}
								onChange={handleInputChange}
								className="h-9 bg-background text-xs sm:h-10 sm:text-sm"
								placeholder="Your full name"
							/>
						</div>
						<div>
							<label className="mb-2 block text-xs font-medium sm:text-sm">
								Username
							</label>
							<Input
								name="username"
								value={formData.username}
								onChange={handleInputChange}
								disabled={!usernameChangeable}
								className={`h-9 text-xs sm:h-10 sm:text-sm ${
									usernameChangeable ? "bg-background" : "bg-muted"
								}`}
							/>
							{!usernameChangeable ? (
								<p className="mt-1 text-xs text-orange-500">
									Username can be changed again in {getDaysRemaining()} days
								</p>
							) : (
								<p className="mt-1 text-xs text-muted-foreground">
									You can change your username once per month
								</p>
							)}
						</div>
						<div>
							<label className="mb-2 block text-xs font-medium sm:text-sm">
								Bio
							</label>
							<textarea
								name="Bio"
								value={formData.Bio}
								onChange={handleInputChange}
								className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring sm:min-h-28 sm:text-sm"
								placeholder="Tell us about yourself..."
								maxLength={500}
							/>
							<p className="mt-1 text-xs text-muted-foreground">
								{formData.Bio.length}/500
							</p>
						</div>
					</div>
				</div>

				{/* Developer Status */}
				<div className="mb-6 rounded-lg border border-border bg-card p-4 sm:p-6">
					<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold sm:text-base">
						<Briefcase className="h-4 w-4" />
						Developer Status
					</h2>
					<div className="space-y-4">
						<div>
							<label className="mb-2 block text-xs font-medium sm:text-sm">
								Currently Working On
							</label>
							<Input
								name="currentlyWorkingOn"
								value={formData.currentlyWorkingOn}
								onChange={handleInputChange}
								className="h-9 bg-background text-xs sm:h-10 sm:text-sm"
								placeholder="What are you currently working on?"
							/>
						</div>
						<div>
							<label className="mb-2 block text-xs font-medium sm:text-sm">
								Looking For
							</label>
							<Input
								name="lookingFor"
								value={formData.lookingFor}
								onChange={handleInputChange}
								className="h-9 bg-background text-xs sm:h-10 sm:text-sm"
								placeholder="What are you looking for?"
							/>
						</div>
					</div>
				</div>

				{/* Skills */}
				<div className="mb-6 rounded-lg border border-border bg-card p-4 sm:p-6">
					<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold sm:text-base">
						<Code2 className="h-4 w-4" />
						Skills
					</h2>

					{/* Languages Skills */}
					<div className="mb-6">
						<h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
							<Code2 className="h-3.5 w-3.5" />
							Languages
						</h3>
						<div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
							{SKILL_OPTIONS.Languages.map((skill) => (
								<button
									key={skill}
									onClick={() => toggleSkill("Languages", skill)}
									className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:py-2 ${
										formData.Skills.Languages.includes(skill)
											? "border-primary bg-primary text-primary-foreground"
											: "border-border bg-card text-foreground hover:border-primary/50"
									}`}>
									{skill}
								</button>
							))}
						</div>
					</div>

					{/* Frameworks Skills */}
					<div className="mb-6">
						<h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
							<Code2 className="h-3.5 w-3.5" />
							Frameworks
						</h3>
						<div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
							{SKILL_OPTIONS.Frameworks.map((skill) => (
								<button
									key={skill}
									onClick={() => toggleSkill("Frameworks", skill)}
									className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:py-2 ${
										formData.Skills.Frameworks.includes(skill)
											? "border-primary bg-primary text-primary-foreground"
											: "border-border bg-card text-foreground hover:border-primary/50"
									}`}>
									{skill}
								</button>
							))}
						</div>
					</div>

					{/* Platforms Skills */}
					<div className="mb-6">
						<h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
							<Server className="h-3.5 w-3.5" />
							Platforms
						</h3>
						<div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
							{SKILL_OPTIONS.Platforms.map((skill) => (
								<button
									key={skill}
									onClick={() => toggleSkill("Platforms", skill)}
									className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:py-2 ${
										formData.Skills.Platforms.includes(skill)
											? "border-primary bg-primary text-primary-foreground"
											: "border-border bg-card text-foreground hover:border-primary/50"
									}`}>
									{skill}
								</button>
							))}
						</div>
					</div>

					{/* Tools */}
					<div>
						<h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
							<Wrench className="h-3.5 w-3.5" />
							Tools
						</h3>
						<div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
							{SKILL_OPTIONS.Tools.map((skill) => (
								<button
									key={skill}
									onClick={() => toggleSkill("Tools", skill)}
									className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:py-2 ${
										formData.Skills.Tools.includes(skill)
											? "border-primary bg-primary text-primary-foreground"
											: "border-border bg-card text-foreground hover:border-primary/50"
									}`}>
									{skill}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Interests */}
				<div className="mb-6 rounded-lg border border-border bg-card p-4 sm:p-6">
					<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold sm:text-base">
						<Lightbulb className="h-4 w-4" />
						Interests
					</h2>
					<div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
						{INTEREST_OPTIONS.map((interest) => (
							<button
								key={interest}
								onClick={() => toggleInterest(interest)}
								className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
									formData.interests.includes(interest)
										? "border-primary bg-primary text-primary-foreground"
										: "border-border bg-card text-foreground hover:border-primary/50"
								}`}>
								{interest}
							</button>
						))}
					</div>
				</div>

				<div className="mb-6 rounded-lg border border-border bg-card p-4 sm:p-6">
					<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold sm:text-base">
						<Users className="h-4 w-4" />
						Looking to Connect With
					</h2>
					<p className="mb-4 text-xs text-muted-foreground sm:text-sm">
						Select the roles and expertise you&apos;re looking for in
						collaborators.
					</p>
					<div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
						{ROLE_OPTIONS.map((role) => (
							<button
								key={role}
								onClick={() => toggleRole(role)}
								className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
									formData.lookingToConnectWith.includes(role)
										? "border-primary bg-primary text-primary-foreground"
										: "border-border bg-card text-foreground hover:border-primary/50"
								}`}>
								{role}
							</button>
						))}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="mb-6 flex flex-col gap-2 xs:flex-row xs:gap-3">
					<Link href="/profile" className="flex-1">
						<Button
							variant="outline"
							className="w-full border-border bg-transparent text-xs font-medium hover:bg-accent sm:text-sm">
							Cancel
						</Button>
					</Link>
					<Button
						onClick={handleSave}
						className="flex-1 bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90 sm:text-sm">
						Save Changes
					</Button>
				</div>
			</main>
		</div>
	);
}
