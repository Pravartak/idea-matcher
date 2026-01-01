"use client";

import type React from "react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Frame, Code2, Server, Wrench } from "lucide-react";

const DEFAULT_SKILLS = [
	"HTML",
	"CSS",
	"JavaScript",
	"TypeScript",
	"React",
	"Next.js",
	"Node.js",
	"Express",
	"MongoDB",
	"PostgreSQL",
	"Python",
	"Django",
	"Java",
	"Spring Boot",
	"C++",
	"Rust",
	"Go",
	"DevOps",
	"Docker",
	"Kubernetes",
	"AWS",
	"Firebase",
	"Figma",
	"UI Design",
];

const SKILLS = {
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
		"Jira",
		"Trello",
		"Figma",
		"Sketch",
		"Adobe XD",
		"VS Code",
		"IntelliJ IDEA",
	],
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
	Languages: Code2,
	Frameworks: Frame,
	Platforms: Server,
	Tools: Wrench,
};

export default function SkillsPage() {
	const router = useRouter();
	const [skills, setSkills] = useState<string[]>([]);
	const [options, setOptions] = useState<string[]>(DEFAULT_SKILLS);
	const [custom, setCustom] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [userUid, setUserUid] = useState<string | null>(null);

	useEffect(() => {
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUserUid(user.uid);
			}
		});
		return () => unsubscribe();
	}, []);

	function toggleSkill(s: string) {
		setSkills((prev) =>
			prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
		);
	}

	function addCustom() {
		const trimmed = custom.trim();
		if (!trimmed) return;
		if (!options.includes(trimmed)) {
			setOptions((prev) => [trimmed, ...prev]);
		}
		setSkills((prev) => (prev.includes(trimmed) ? prev : [trimmed, ...prev]));
		setCustom("");
	}

	function handleCustomKey(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			e.preventDefault();
			addCustom();
		}
	}

	async function handleContinue() {
		if (!userUid) {
			console.error("No user found. Cannot save skills.");
			// Optionally, redirect to a login page
			return;
		}

		setIsSubmitting(true);

		const categorizedSkills: Record<string, string[]> = {
			Languages: [],
			Frameworks: [],
			Platforms: [],
			Tools: [],
		};

		skills.forEach((skill) => {
			let found = false;
			for (const [category, list] of Object.entries(SKILLS)) {
				if (list.includes(skill)) {
					categorizedSkills[category].push(skill);
					found = true;
					break;
				}
			}
			if (!found) {
				categorizedSkills.Tools.push(skill);
			}
		});

		try {
			await updateDoc(doc(db, "users", userUid), {
				Skills: categorizedSkills,
			});
			router.push("/home");
		} catch (error) {
			console.error("Error updating skills:", error);
		} finally {
			setIsSubmitting(false);
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
						Step 3 of 3
					</div>
				</div>
			</header>

			<section className="mx-auto w-full max-w-4xl px-4 py-10 md:py-12">
				<div className="space-y-2">
					<h1 className="text-2xl md:text-3xl font-semibold text-pretty">
						Add Your Skills
					</h1>
					<p className="text-sm text-muted-foreground">
						Tell us what you're good at so we can match you with the right
						people.
					</p>
				</div>

				{/* Skills grid */}
				<div className="mt-8 space-y-8">
					{(Object.entries(SKILLS) as [string, string[]][]).map(
						([category, categorySkills]) => {
							const Icon = CATEGORY_ICONS[category];
							return (
								<div key={category}>
									<h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
										{Icon && <Icon className="h-4 w-4" />}
										{category}
									</h3>
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
										{categorySkills.map((s) => {
											const selected = skills.includes(s);
											return (
												<button
													key={s}
													type="button"
													onClick={() => toggleSkill(s)}
													className={cn(
														"rounded-md border px-3 py-2 text-sm transition",
														"border-border bg-card hover:border-foreground/25",
														selected &&
															"bg-foreground text-background font-semibold"
													)}>
													{s}
												</button>
											);
										})}
									</div>
								</div>
							);
						}
					)}
				</div>

				{/* Custom skill */}
				<div className="mt-6 flex items-center gap-2">
					<Input
						value={custom}
						onChange={(e) => setCustom(e.target.value)}
						onKeyDown={handleCustomKey}
						placeholder="+ Add custom skill"
						className="bg-background border-border focus-visible:ring-1 focus-visible:ring-foreground"
					/>
					<Button
						onClick={addCustom}
						variant="secondary"
						className="bg-card text-foreground border border-border hover:bg-card/80">
						Add
					</Button>
				</div>

				{/* Actions */}
				<div className="mt-10 flex items-center justify-between">
					<Button variant="outline" asChild>
						<Link href="onboarding/interests">Back</Link>
					</Button>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={handleContinue}
							disabled={skills.length === 0 || isSubmitting}
							className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60">
							{isSubmitting ? "Saving..." : "Continue"}
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}
