import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="container mx-auto flex min-h-dvh items-center justify-center p-6">{children}</section>
    </main>
  )
}
