"use client"

import { UserCard } from "./user-card"
import type { User } from "@/app/connections/page"

type Props = {
  users: User[]
  onConnect: (userId: string) => void
}

export function RecommendedConnectionsGrid({ users, onConnect }: Props) {
  if (!users.length) {
    return <div className="text-sm text-muted-foreground">No users found. Try adjusting your search or filter.</div>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((u) => (
        <UserCard key={u.id} user={u} onConnect={onConnect} />
      ))}
    </div>
  )
}
