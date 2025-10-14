"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type Message = { id: string; author: string; text: string; at: string }
type Chat = { id: string; name: string; messages: Message[] }

export default function SidePanel({ className }: { className?: string }) {
  const [collapsed, setCollapsed] = useState(false)

  const [individual, setIndividual] = useState<Chat>({
    id: "c1",
    name: "Avery",
    messages: [
      { id: "m1", author: "Avery", text: "Hey! Excited to collaborate.", at: "10:24" },
      { id: "m2", author: "You", text: "Same here—let’s match skills.", at: "10:25" },
    ],
  })
  const [group, setGroup] = useState<Chat>({
    id: "g1",
    name: "Midnight Builders",
    messages: [
      { id: "m1", author: "Devon", text: "Standup at 6pm UTC.", at: "11:05" },
      { id: "m2", author: "You", text: "Roger that, see you all.", at: "11:06" },
    ],
  })
  const [team, setTeam] = useState<Chat>({
    id: "t1",
    name: "Hackathon Alpha",
    messages: [
      { id: "m1", author: "Maya", text: "Deck finalized. Review?", at: "12:10" },
      { id: "m2", author: "You", text: "Looks great—pushing assets next.", at: "12:12" },
    ],
  })

  const [inputInd, setInputInd] = useState("")
  const [inputGroup, setInputGroup] = useState("")
  const [inputTeam, setInputTeam] = useState("")

  function sendMessage(type: "individual" | "group" | "team") {
    const text = type === "individual" ? inputInd.trim() : type === "group" ? inputGroup.trim() : inputTeam.trim()
    if (!text) return
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      author: "You",
      text,
      at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    if (type === "individual") {
      setIndividual({ ...individual, messages: [...individual.messages, msg] })
      setInputInd("")
    } else if (type === "group") {
      setGroup({ ...group, messages: [...group.messages, msg] })
      setInputGroup("")
    } else {
      setTeam({ ...team, messages: [...team.messages, msg] })
      setInputTeam("")
    }
  }

  return (
    <aside
      className={cn(
        "rounded-xl border border-border bg-background/60 backdrop-blur p-3 md:p-4 space-y-4 transition-[width,height,padding] duration-200",
        collapsed && "p-2 space-y-2",
        className,
      )}
      aria-label="Chat sidebar"
      aria-expanded={!collapsed}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono text-foreground/90">Chats</h2>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-md border border-border/60 bg-background/40 hover:bg-background/60 px-2 py-1 text-xs font-mono transition"
          aria-pressed={collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>

      {collapsed ? (
        <div className="grid grid-cols-3 gap-2">
          <span className="text-[10px] font-mono text-muted-foreground text-center py-1 rounded border border-border">
            1:1
          </span>
          <span className="text-[10px] font-mono text-muted-foreground text-center py-1 rounded border border-border">
            Projects
          </span>
          <span className="text-[10px] font-mono text-muted-foreground text-center py-1 rounded border border-border">
            Teams
          </span>
        </div>
      ) : (
        <>
          <section aria-labelledby="individual-chats">
            <header className="flex items-center justify-between">
              <h3 id="individual-chats" className="text-sm font-mono font-medium">
                Individual chats
              </h3>
            </header>
            <div className="mt-2 h-40 overflow-y-auto rounded-md border border-border/60 p-2 bg-background/40 text-sm">
              <ul className="space-y-2">
                {individual.messages.map((m) => (
                  <li key={m.id} className="flex items-start gap-2">
                    <span className="text-muted-foreground text-xs pt-0.5">{m.at}</span>
                    <div>
                      <span className="text-foreground/90 font-mono">{m.author}:</span>{" "}
                      <span className="text-muted-foreground">{m.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={inputInd}
                onChange={(e) => setInputInd(e.target.value)}
                placeholder="Message Avery"
                className="flex-1 rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 font-mono"
              />
              <button
                onClick={() => sendMessage("individual")}
                className="rounded-md border border-border px-3 py-2 text-sm hover:bg-foreground hover:text-background transition font-mono"
              >
                Send
              </button>
            </div>
          </section>

          <section aria-labelledby="group-chats">
            <header className="flex items-center justify-between">
              <h3 id="group-chats" className="text-sm font-mono font-medium">
                Project group chats
              </h3>
            </header>
            <div className="mt-2 h-40 overflow-y-auto rounded-md border border-border/60 p-2 bg-background/40 text-sm">
              <ul className="space-y-2">
                {group.messages.map((m) => (
                  <li key={m.id} className="flex items-start gap-2">
                    <span className="text-muted-foreground text-xs pt-0.5">{m.at}</span>
                    <div>
                      <span className="text-foreground/90 font-mono">{m.author}:</span>{" "}
                      <span className="text-muted-foreground">{m.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={inputGroup}
                onChange={(e) => setInputGroup(e.target.value)}
                placeholder="Message project group"
                className="flex-1 rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 font-mono"
              />
              <button
                onClick={() => sendMessage("group")}
                className="rounded-md border border-border px-3 py-2 text-sm hover:bg-foreground hover:text-background transition font-mono"
              >
                Send
              </button>
            </div>
          </section>

          <section aria-labelledby="team-chats">
            <header className="flex items-center justify-between">
              <h3 id="team-chats" className="text-sm font-mono font-medium">
                Hackathon team chats
              </h3>
            </header>
            <div className="mt-2 h-40 overflow-y-auto rounded-md border border-border/60 p-2 bg-background/40 text-sm">
              <ul className="space-y-2">
                {team.messages.map((m) => (
                  <li key={m.id} className="flex items-start gap-2">
                    <span className="text-muted-foreground text-xs pt-0.5">{m.at}</span>
                    <div>
                      <span className="text-foreground/90 font-mono">{m.author}:</span>{" "}
                      <span className="text-muted-foreground">{m.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={inputTeam}
                onChange={(e) => setInputTeam(e.target.value)}
                placeholder="Message hackathon team"
                className="flex-1 rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 font-mono"
              />
              <button
                onClick={() => sendMessage("team")}
                className="rounded-md border border-border px-3 py-2 text-sm hover:bg-foreground hover:text-background transition font-mono"
              >
                Send
              </button>
            </div>
          </section>
        </>
      )}
    </aside>
  )
}
