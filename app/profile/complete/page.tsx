"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

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
] as const

export default function ProfileCompletePage() {
  const [selected, setSelected] = useState<string[]>([])
  const router = useRouter()

  function toggleInterest(tag: string) {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-mono text-sm font-semibold">
            Idea&nbsp;Matcher
            <span className="sr-only">Home</span>
          </Link>
          <div className="text-xs text-muted-foreground">Step 1 of 3</div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-balance font-mono text-2xl font-semibold leading-tight">Complete Your Profile</h1>
            <p className="text-pretty text-sm text-muted-foreground">
              Choose your interests so we can match you better.
            </p>
          </div>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-mono text-sm font-semibold text-muted-foreground">Select your interests</h2>

            {/* Interest pills */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {ALL_INTERESTS.map((tag) => {
                const active = selected.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleInterest(tag)}
                    className={[
                      "rounded-full border px-3 py-2 text-left text-xs transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      active
                        ? "border-transparent bg-foreground font-semibold text-background"
                        : "border-neutral-800 bg-neutral-900 text-foreground hover:border-white/30",
                    ].join(" ")}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between">
              <Link
                href="/"
                className="text-xs text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
              >
                Skip for now
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="rounded-md border border-border bg-card px-4 py-2 text-xs transition hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Back
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    router.push("/onboarding/skills")
                  }}
                  className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
                >
                  Continue
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
