import HackathonTeamsGrid from "@/components/hackathon-teams/hackathon-teams-grid"
import { Navbar } from "@/components/navbar"

export default function HackathonTeamsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-background text-foreground">
        <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <header className="mb-6 md:mb-8 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Hackathon Teams</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Find teams forming for upcoming hackathons and join the right crew.
              </p>
            </div>
          </header>
          <HackathonTeamsGrid />
        </section>
      </main>
    </>
  )
}
