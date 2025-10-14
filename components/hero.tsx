import Link from "next/link"

export function Hero() {
  return (
    <section id="home" className="relative isolate mx-auto max-w-6xl px-4 pt-16 pb-20" aria-labelledby="hero-title">
      {/* Subtle grid/pattern */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
        {/* Glow behind headline */}
        <div className="absolute left-1/2 top-8 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="text-center">
        <h1 id="hero-title" className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          {"Find developers who share your vision."}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          {
            "Idea Matcher helps students and indie builders connect with collaborators who share similar interests, skills, and project goals."
          }
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Start Matching
          </Link>
          <Link
            href="/about"
            className="rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-card"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  )
}
