"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { User } from "@/app/connections/ConnectionsClient"

type Props = {
  user: User
  onConnect: (userId: string) => void
}

export function UserCard({ user, onConnect }: Props) {
  return (
    <div
      className={[
        "group rounded-xl border border-border bg-background/60",
        "backdrop-blur supports-[backdrop-filter]:bg-background/50",
        "p-4 transition-all duration-200 hover:border-foreground/30",
        "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_30px_rgba(0,0,0,0.25)]",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border">
          <Image
            src={user.avatar || "/placeholder.svg"}
            alt={`Avatar of ${user.name}`}
            fill
            sizes="48px"
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium truncate">{user.name}</h3>
            <Button size="sm" onClick={() => onConnect(user.id)} className="transition-colors">
              Connect
            </Button>
          </div>

          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{user.bio}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {user.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-xs text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
