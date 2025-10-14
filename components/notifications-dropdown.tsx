"use client"

import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type Notification = {
  id: string
  title: string
  detail: string
  time: string
}

const projectNotifs: Notification[] = [
  { id: "pn1", title: "PR merged in UI Kit", detail: "Your changes were merged to main.", time: "2h ago" },
  { id: "pn2", title: "New issue in LLM Email", detail: "#128: Draft mode bug opened", time: "4h ago" },
]

const individualNotifs: Notification[] = [
  { id: "in1", title: "Ava mentioned you", detail: "‘Can you review the outline?’", time: "1h ago" },
]

const teamNotifs: Notification[] = [
  { id: "tn1", title: "Hackathon Alpha standup", detail: "Daily at 10am. Join in 15 minutes.", time: "Now" },
]

export function NotificationsDropdown() {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative font-mono h-9 px-3 text-foreground hover:bg-background/40 border border-transparent hover:border-border/60 rounded-lg"
          aria-label="Open notifications"
        >
          Notifications
          <span className="sr-only">Open notifications</span>
          {/* dot */}
          <span className="absolute -top-1 -right-1 inline-block h-2 w-2 rounded-full bg-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[360px] p-2 bg-background/70 backdrop-blur-md border border-border/60 shadow-lg rounded-xl"
      >
        <Section title="Projects" items={projectNotifs} />
        <Section title="Individuals" items={individualNotifs} />
        <Section title="Hackathon Teams" items={teamNotifs} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Section({ title, items }: { title: string; items: Notification[] }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground font-mono">{title}</div>
      <div className="grid gap-2">
        {items.map((n) => (
          <article
            key={n.id}
            className="rounded-lg border border-border/60 bg-background/60 hover:bg-background/50 transition-colors p-3 shadow-sm"
          >
            <h4 className="font-mono text-sm text-foreground">{n.title}</h4>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">{n.detail}</p>
            <div className="font-mono text-[10px] text-muted-foreground/80 mt-1">{n.time}</div>
          </article>
        ))}
      </div>
    </div>
  )
}
