import Link from "next/link"

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <Link href="#" className="font-mono text-lg font-bold text-foreground">
        IdeaMatcher_
      </Link>
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/home" className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors">
          Home
        </Link>
        <Link href="/about" className="font-mono text-sm text-muted-foreground">
          About
        </Link>
        <Link
          href="/projects"
          className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Projects
        </Link>
        <Link
          href="/hackathon-teams"
          className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Hackathon Teams
        </Link>
        <Link
          href="/connections"
          className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Connections
        </Link>
        <Link
          href="#"
          className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors relative"
        >
          Notifications
          <span className="absolute -top-1 -right-2 w-2 h-2 bg-blue-500 rounded-full" />
        </Link>
      </nav>
    </header>
  )
}
