"use client";

import { cn } from "@/lib/utils"; // Assuming a utils file, or define it locally
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase"; // Assuming you have this config file
import { doc, updateDoc } from "firebase/firestore";

const ALL_INTERESTS = [
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
] as const;

export default function ProfileCompletePage() {
	const [selected, setSelected] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		const storedUsername = localStorage.getItem("username");
		setUsername(storedUsername);
	});

	function toggleInterest(tag: string) {
		setSelected((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	}

	async function handleContinue() {
		if (!username) {
			console.error("No user found. Cannot save interests.");
			// Optionally, redirect to a login page
			return;
		}

		setIsSubmitting(true);
		try {
			await updateDoc(doc(db, "users", username), {
				interests: selected,
			});
			router.push("/onboarding/skills");
		} catch (error) {
			console.error("Error updating interests:", error);
			// You could show an error message to the user here
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="min-h-dvh bg-background text-foreground">
			{/* Sticky top bar */}
			<header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto w-full max-w-3xl px-4 py-3 flex items-center justify-between">
					<Link href="/" className="font-mono text-sm md:text-base">
						<span className="font-semibold">Idea Matcher</span>
					</Link>
					<div className="text-xs md:text-sm text-muted-foreground">
						Step 2 of 3
					</div>
				</div>
			</header>

			<main className="mx-auto w-full max-w-5xl px-4 py-10">
				<div className="mx-auto max-w-3xl">
					<div className="mb-8 space-y-2 text-center">
						<h1 className="text-balance font-mono text-2xl font-semibold leading-tight">
							Your Interests
						</h1>
						<p className="text-pretty text-sm text-muted-foreground">
							Choose your interests so we can match you better.
						</p>
					</div>

					<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
						<h2 className="mb-4 font-mono text-sm font-semibold text-muted-foreground">
							Select your interests
						</h2>

						{/* Interest pills */}
						<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
							{ALL_INTERESTS.map((tag) => {
								const active = selected.includes(tag);
								return (
									<button
										key={tag}
										type="button"
										aria-pressed={active}
										onClick={() => toggleInterest(tag)}
										className={cn(
											"rounded-full border px-3 py-2 text-left text-xs transition",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
											active
												? "border-transparent bg-foreground font-semibold text-background"
												: "border-neutral-800 bg-neutral-900 text-foreground hover:border-white/30"
										)}>
										{tag}
									</button>
								);
							})}
						</div>

						{/* Actions */}
						<div className="mt-6 flex items-center justify-between">
							<Link
								href="/onboarding/skills"
								className="text-xs text-muted-foreground underline underline-offset-4 transition hover:text-foreground">
								Skip for now
							</Link>

							<div className="flex items-center gap-3">
								<Link
									href="/onboarding/profile"
									className="rounded-md border border-border bg-card px-4 py-2 text-xs transition hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
									Back
								</Link>
								<button
									type="button"
									onClick={handleContinue}
									disabled={selected.length === 0 || isSubmitting}
									className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60">
									{isSubmitting ? "Saving..." : "Continue"}
								</button>
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}
