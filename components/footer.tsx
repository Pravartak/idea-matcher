"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export function Footer() {
  const [year, setYear] = useState("")

  useEffect(() => {
    setYear(new Date().getFullYear().toString())
  }, [])

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="order-2 md:order-1">© {year} IdeaMatcher. All rights reserved.</div>
        <nav className="order-1 flex flex-wrap items-center gap-4 md:order-2">
          <Link href="/about" className="transition-colors hover:text-foreground">
            About
          </Link>
          <Link href="/legal/Privacy-Policy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="/legal/ToS" className="transition-colors hover:text-foreground">
            Terms of Service
          </Link>
          <a
            href="https://github.com/Pravartak"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
