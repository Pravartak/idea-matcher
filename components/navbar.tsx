"use client";

import Link from "next/link";
import { NotificationsDropdown } from "@/components/notifications-dropdown";

export function Navbar() {
	const links = [
		{ href: "/home", label: "Home" },
		{ href: "/about", label: "About" },
		{ href: "/projects", label: "Projects" },
		{ href: "/hackathon-teams", label: "Hackathon Teams" },
		{ href: "/connections", label: "Connections" },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
			<nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<Link
					href="/"
					className="font-mono text-sm font-semibold tracking-tight text-foreground">
					IdeaMatcher_
					<span className="sr-only">Idea Matcher logo</span>
				</Link>

				<div className="hidden items-center gap-6 md:flex">
					{links.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm text-muted-foreground transition-colors hover:text-foreground">
							{link.label}
						</Link>
					))}

					<NotificationsDropdown />
				</div>
			</nav>
			<div className="border-t border-border/70 md:hidden">
				<div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2">
					{links.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="shrink-0 rounded-md border border-border/70 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/40">
							{link.label}
						</Link>
					))}
				</div>
			</div>
		</header>
	);
}
