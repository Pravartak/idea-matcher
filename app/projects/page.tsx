import ProjectsGrid from "@/components/projects/projects-grid"
import { Navbar } from "@/components/navbar"

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-background text-foreground">
        <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <header className="mb-6 md:mb-8 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Projects</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Discover projects and join teams that match your skills and interests.
              </p>
            </div>
          </header>
          <ProjectsGrid />
        </section>
      </main>
    </>
  )
}
