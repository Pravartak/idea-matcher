"use client"

import { cn } from "@/lib/utils"

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

export default function HackathonTeamCard({
  team,
  onJoin,
  className,
}: {
  team: Team
  onJoin: (id: string) => void
  className?: string
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50",
        "p-5 md:p-6 transition-all hover:shadow-lg hover:shadow-black/10",
        className,
      )}
      aria-label={team.teamName}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-medium">{team.teamName}</h3>
            <p className="text-sm text-muted-foreground">{team.hackathonName}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {team.currentMembers}/{team.maxMembers}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{team.location}</span>
          <span className="opacity-60">•</span>
          <span>{team.datetime}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {team.roles.map((r) => (
            <span key={r} className="rounded-md bg-background/60 border border-border/60 px-2 py-1 text-xs">
              {r}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={() => onJoin(team.id)}
            className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-sm hover:bg-foreground hover:text-background transition-colors"
            aria-label={`Join ${team.teamName}`}
          >
            Join Team
          </button>
        </div>
      </div>
    </article>
  )
}
