"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export function Footer() {
  const [year, setYear] = useState("")
  const links = [
    { href: "/about", label: "About" },
    { href: "/legal/Privacy-Policy", label: "Privacy" },
    { href: "/legal/ToS", label: "Terms of Service" },
  ]

  useEffect(() => {
    setYear(new Date().getFullYear().toString())
  }, [])

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground md:flex-row">
        <div className="order-2 text-center md:order-1 md:text-left">(c) {year} IdeaMatcher. All rights reserved.</div>
        <nav className="order-1 flex flex-wrap items-center justify-center gap-2 md:order-2 md:justify-end">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-border/70 px-3 py-2 transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/Pravartak"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border/70 px-3 py-2 transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
