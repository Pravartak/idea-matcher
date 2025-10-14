"use client"

import { useMemo, useState } from "react"
import HackathonTeamCard from "./hackathon-team-card"

type Team = {
  id: string
  teamName: string
  hackathonName: string
  location: string
  datetime: string
  roles: string[]
  currentMembers: number
  maxMembers: number
}

const SAMPLE_TEAMS: Team[] = [
  {
    id: "t1",
    teamName: "Latency Busters",
    hackathonName: "Vercel Ship",
    location: "San Francisco, CA",
    datetime: "Nov 10, 10:00 AM",
    roles: ["Frontend", "Backend", "AI"],
    currentMembers: 2,
    maxMembers: 5,
  },
  {
    id: "t2",
    teamName: "FinOps Wizards",
    hackathonName: "Open Finance Hack",
    location: "Remote",
    datetime: "Dec 02, 9:00 AM UTC",
    roles: ["Fullstack", "Designer"],
    currentMembers: 3,
    maxMembers: 6,
  },
  {
    id: "t3",
    teamName: "Geo Devs",
    hackathonName: "Maps & Mobility",
    location: "Berlin, Germany",
    datetime: "Jan 14, 11:00 AM",
    roles: ["Backend", "Data"],
    currentMembers: 1,
    maxMembers: 4,
  },
]

export default function HackathonTeamsGrid() {
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("All")

  const filtered = useMemo(() => {
    return SAMPLE_TEAMS.filter((t) => {
      const q = query.trim().toLowerCase()
      const matchesQuery =
        q.length === 0 ||
        t.teamName.toLowerCase().includes(q) ||
        t.hackathonName.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q)

      const matchesRole = role === "All" || t.roles.includes(role)

      return matchesQuery && matchesRole
    })
  }, [query, role])

  function handleJoinTeam(teamId: string) {
    console.log("[v0] Join Team clicked:", teamId)
    alert("Join Team clicked for " + teamId)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-background/60 backdrop-blur p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="text"
            placeholder="Search teams or hackathons..."
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
              <option>AI</option>
              <option>Data</option>
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
          {filtered.map((t) => (
            <HackathonTeamCard key={t.id} team={t} onJoin={handleJoinTeam} />
          ))}
        </div>
      </div>
    </div>
  )
}
