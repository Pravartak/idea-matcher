"use client";

import Link from "next/link";
import { NotificationsDropdown } from "@/components/notifications-dropdown";

export function Navbar() {

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
			<nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<Link
					href="#"
					className="font-mono text-sm font-semibold tracking-tight text-foreground">
					IdeaMatcher_
					<span className="sr-only">Idea Matcher logo</span>
				</Link>

				<div className="hidden items-center gap-6 md:flex">
					<Link
						href="/home"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground">
						Home
					</Link>
					<Link
						href="/about"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground">
						About
					</Link>
					<Link
						href="/projects"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground">
						Projects
					</Link>
					<Link
						href="/hackathon-teams"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground">
						Hackathon Teams
					</Link>
					<Link
						href="/connections"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground">
						Connections
					</Link>

					<NotificationsDropdown />
				</div>
			</nav>
		</header>
	);
}
