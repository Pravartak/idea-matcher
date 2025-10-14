"use client"

import { useMemo, useState } from "react"
import ProjectCard from "./project-card"

type Project = {
  id: string
  name: string
  description: string
  techStack: string[]
  roles: string[]
  maxMembers: number
  currentMembers: number
  timezone: string
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "AI Note Summarizer",
    description: "A web app that summarizes meeting notes with AI and exports decisions.",
    techStack: ["Next.js", "TypeScript", "AI SDK"],
    roles: ["Frontend", "Backend", "Designer"],
    maxMembers: 6,
    currentMembers: 3,
    timezone: "UTC-5 to UTC+1",
  },
  {
    id: "p2",
    name: "Open Finance Dashboard",
    description: "Track spending, budgets, and goals with bank integrations.",
    techStack: ["React", "Tailwind", "Neon"],
    roles: ["Fullstack", "Data", "QA"],
    maxMembers: 5,
    currentMembers: 2,
    timezone: "UTC-8 to UTC-3",
  },
  {
    id: "p3",
    name: "Dev Communities Map",
    description: "Discover local dev communities and events by interests.",
    techStack: ["Next.js", "Leaflet", "Upstash"],
    roles: ["Frontend", "Backend"],
    maxMembers: 4,
    currentMembers: 1,
    timezone: "UTC+0 to UTC+5",
  },
]

export default function ProjectsGrid() {
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("All")
  const [stack, setStack] = useState("All")

  const filtered = useMemo(() => {
    return SAMPLE_PROJECTS.filter((p) => {
      const q = query.trim().toLowerCase()
      const matchesQuery = q.length === 0 || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)

      const matchesRole = role === "All" || p.roles.includes(role)
      const matchesStack = stack === "All" || p.techStack.includes(stack)

      return matchesQuery && matchesRole && matchesStack
    })
  }, [query, role, stack])

  function handleJoinProject(projectId: string) {
    console.log("[v0] Join Project clicked:", projectId)
    alert("Join Project clicked for " + projectId)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-background/60 backdrop-blur p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="text"
            placeholder="Search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-sans outline-none focus-visible:ring-1 focus-visible:ring-foreground"
          />
          <div className="grid grid-cols-2 md:flex gap-2 md:gap-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-sans"
            >
              <option>All</option>
              <option>Frontend</option>
              <option>Backend</option>
              <option>Fullstack</option>
              <option>Designer</option>
              <option>Data</option>
              <option>QA</option>
            </select>
            <select
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-sans"
            >
              <option>All</option>
              <option>Next.js</option>
              <option>TypeScript</option>
              <option>React</option>
              <option>Tailwind</option>
              <option>AI SDK</option>
              <option>Neon</option>
              <option>Upstash</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onJoin={handleJoinProject} />
          ))}
        </div>
      </div>
    </div>
  )
}
