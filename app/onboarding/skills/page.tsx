"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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
]

export default function SkillsPage() {
  const [skills, setSkills] = useState<string[]>([])
  const [options, setOptions] = useState<string[]>(DEFAULT_SKILLS)
  const [custom, setCustom] = useState("")

  function toggleSkill(s: string) {
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  function addCustom() {
    const trimmed = custom.trim()
    if (!trimmed) return
    if (!options.includes(trimmed)) {
      setOptions((prev) => [trimmed, ...prev])
    }
    setSkills((prev) => (prev.includes(trimmed) ? prev : [trimmed, ...prev]))
    setCustom("")
  }

  function handleCustomKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      addCustom()
    }
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-4xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-mono text-sm md:text-base">
            <span className="font-semibold">Idea Matcher</span>
          </Link>
          <div className="text-xs md:text-sm text-muted-foreground">Step 2 of 3</div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-4xl px-4 py-10 md:py-12">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Add Your Skills</h1>
          <p className="text-sm text-muted-foreground">
            Tell us what you’re good at so we can match you with the right people.
          </p>
        </div>

        {/* Skills grid */}
        <div className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {options.map((s) => {
              const selected = skills.includes(s)
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition",
                    "border-border bg-card hover:border-foreground/25",
                    selected && "bg-foreground text-background font-semibold",
                  )}
                >
                  {s}
                </button>
              )
            })}
          </div>
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
            className="bg-card text-foreground border border-border hover:bg-card/80"
          >
            Add
          </Button>
        </div>

        {/* Actions */}
        <div className="mt-10 flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/profile/complete">Back</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/onboarding/profile">Skip</Link>
            </Button>
            <Button asChild>
              <Link href="/onboarding/profile">Continue</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
