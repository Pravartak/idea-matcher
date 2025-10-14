"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Props = {
  query: string
  onQueryChange: (v: string) => void
  filter: string
  filters: string[]
  onFilterChange: (v: string) => void
}

export function RecommendedNavbar({ query, onQueryChange, filter, filters, onFilterChange }: Props) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-border",
        "bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="font-mono text-sm md:text-base font-semibold tracking-tight text-foreground">
          IdeaMatcher_
          <span className="sr-only">Go to home</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3 w-full max-w-xl">
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search users by name"
            className="bg-background border-border focus-visible:ring-1 focus-visible:ring-foreground"
          />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className={cn(
              "rounded-md border bg-background p-2 text-sm font-mono", // enforce JetBrains Mono
              "border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground",
            )}
            aria-label="Filter by skill"
            title="Filter by skill"
          >
            {filters.map((f) => (
              <option key={f} value={f} className="font-mono">
                {f === "all" ? "All Skills" : f}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
