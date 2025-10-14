import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="order-2 md:order-1">© {new Date().getFullYear()} Idea Matcher. All rights reserved.</div>
        <nav className="order-1 flex flex-wrap items-center gap-4 md:order-2">
          <Link href="#about" className="transition-colors hover:text-foreground">
            About
          </Link>
          <Link href="#privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="#terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Twitter
          </a>
        </nav>
      </div>
    </footer>
  )
}
