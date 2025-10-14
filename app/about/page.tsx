import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About | Idea Matcher",
  description: "Learn more about Idea Matcher and our mission.",
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <header className="mb-8">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          About Idea Matcher
        </h1>
        <p className="mt-3 text-muted-foreground">
          Idea Matcher helps students and indie builders find collaborators who share similar interests, skills, and
          project goals.
        </p>
      </header>

      <section className="prose prose-invert prose-p:leading-relaxed">
        <p>
          We believe great products are built by aligned teams. Our matching system focuses on motivation, values, and
          practical skills to connect you with the right partners.
        </p>
        <p>
          Whether you&apos;re exploring a new concept or ready to ship, Idea Matcher reduces the friction of finding
          teammates so you can spend more time building.
        </p>
      </section>
    </main>
  )
}
