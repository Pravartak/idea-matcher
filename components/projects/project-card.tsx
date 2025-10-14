"use client"

import { cn } from "@/lib/utils"

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

export default function ProjectCard({
  project,
  onJoin,
  className,
}: {
  project: Project
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
      aria-label={project.name}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg md:text-xl font-medium">{project.name}</h3>
          <span className="text-xs text-muted-foreground shrink-0">
            {project.currentMembers}/{project.maxMembers}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>

        <div className="flex flex-wrap gap-2 pt-1">
          {project.techStack.map((t) => (
            <span key={t} className="rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground">
              {t}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {project.roles.map((r) => (
            <span key={r} className="rounded-md bg-background/60 border border-border/60 px-2 py-1 text-xs">
              {r}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">Timezone: {project.timezone}</span>
          <button
            onClick={() => onJoin(project.id)}
            className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-sm hover:bg-foreground hover:text-background transition-colors"
            aria-label={`Join ${project.name}`}
          >
            Join Project
          </button>
        </div>
      </div>
    </article>
  )
}
