"use client"

import { useMemo, useState } from "react"
import { RecommendedNavbar } from "@/components/recommended/navbar"
import { RecommendedConnectionsGrid } from "@/components/recommended/recommended-connections-grid"
import { Navbar } from "@/components/navbar"

// Mock users dataset. Replace with real data later.
export type User = {
  id: string
  name: string
  bio: string
  avatar: string
  skills: string[]
}

const USERS: User[] = [
  {
    id: "1",
    name: "Avery Chen",
    bio: "Fullstack dev building tools for founders.",
    avatar: "/diverse-person-avatars.png",
    skills: ["React", "TypeScript", "Node.js"],
  },
  {
    id: "2",
    name: "Devon Lee",
    bio: "Product-minded engineer. Shipping fast, learning faster.",
    avatar: "/portrait-avatar.png",
    skills: ["Product", "React", "UX"],
  },
  {
    id: "3",
    name: "Maya Patel",
    bio: "Designer who codes. Systems, motion, and microinteractions.",
    avatar: "/diverse-designer-avatars.png",
    skills: ["Design", "Figma", "Branding"],
  },
  {
    id: "4",
    name: "Samir Khan",
    bio: "Research to reality: prototyping AI-first experiences.",
    avatar: "/diverse-profile-avatars.png",
    skills: ["AI/ML", "Python", "Research"],
  },
  {
    id: "5",
    name: "Elena Garcia",
    bio: "Early-stage founder exploring social creation tools.",
    avatar: "/professional-headshot.png",
    skills: ["Founder", "Strategy", "Go-To-Market"],
  },
]

export default function RecommendedConnectionsPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<string>("all")

  // All unique skills to populate the filter dropdown.
  const allSkills = useMemo(() => {
    const s = new Set<string>()
    USERS.forEach((u) => u.skills.forEach((sk) => s.add(sk)))
    return ["all", ...Array.from(s)]
  }, [])

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return USERS.filter((u) => {
      const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q)
      const matchesFilter = filter === "all" || u.skills.includes(filter)
      return matchesQuery && matchesFilter
    })
  }, [query, filter])

  function handleConnect(userId: string) {
    // Placeholder for future implementation
    console.log("[v0] Connect clicked for user:", userId)
  }

  return (
    <>
      {/* Add the site Navbar on Recommended Connections page */}
      <Navbar />
      <main className="min-h-dvh bg-background text-foreground">
        <RecommendedNavbar
          query={query}
          onQueryChange={setQuery}
          filter={filter}
          filters={allSkills}
          onFilterChange={setFilter}
        />

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:pt-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Recommended Connections</h1>
            <p className="text-sm text-muted-foreground mt-1">Discover people who match your interests and skills.</p>
          </div>

          <RecommendedConnectionsGrid users={filteredUsers} onConnect={handleConnect} />
        </section>
      </main>
    </>
  )
}
