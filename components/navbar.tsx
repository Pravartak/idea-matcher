"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()
  if (pathname === "/signup" || pathname?.startsWith("/profile/complete")) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight text-foreground">
          IdeaMatcher_
          <span className="sr-only">Idea Matcher logo</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="#home" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            About
          </Link>
          <Link href="/projects" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Projects
          </Link>
          <Link
            href="/hackathon-teams"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Hackathon Teams
          </Link>
          <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Contact
          </Link>
          <Link href="#signin" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  )
}
