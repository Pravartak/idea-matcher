import HackathonTeamsGrid from "@/components/hackathon-teams/hackathon-teams-grid"
import { Navbar } from "@/components/navbar"
import SidePanel from "@/components/side-panel" // add side panel

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

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div>
              <HackathonTeamsGrid />
            </div>
            <aside className="block mt-6 lg:mt-0">
              <SidePanel className="lg:sticky lg:top-[5rem]" />
            </aside>
          </div>
        </section>
      </main>
    </>
  )
}
