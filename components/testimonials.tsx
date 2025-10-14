type Testimonial = {
  name: string
  image: string
  review: string
  interests: string[]
}

const testimonials: Testimonial[] = [
  {
    name: "Avery Kim",
    image: "/avatar-avery.jpg",
    review: "Matched with a front-end partner in 48 hours. We aligned on goals fast and shipped our MVP in 2 weeks.",
    interests: ["#WebDev", "#UI", "#React"],
  },
  {
    name: "Devon Singh",
    image: "/avatar-devon.jpg",
    review: "Great for indie builders. I found a backend collaborator who actually shared my product vision.",
    interests: ["#AppDev", "#APIs", "#Node"],
  },
  {
    name: "Maya Lopez",
    image: "/avatar-maya.jpg",
    review: "The matching signals are spot-on. It pairs you by interests and goals, not just skills.",
    interests: ["#AI", "#Data", "#Product"],
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-balance text-center text-2xl font-semibold text-foreground md:text-3xl">
        {"What our early users say"}
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <article
            key={t.name}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-transform duration-200 hover:scale-[1.01]"
          >
            {/* subtle inner gradient edge */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(120px_80px_at_20%_0%,rgba(99,102,241,0.08),transparent_60%)]" />
            <div className="relative flex items-center gap-4">
              <img
                src={t.image || "/placeholder.svg"}
                alt={`${t.name} profile photo`}
                width={64}
                height={64}
                className="h-12 w-12 rounded-full border border-border object-cover"
              />
              <div>
                <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Early adopter</p>
              </div>
            </div>
            <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">{`“${t.review}”`}</p>
            <div className="relative mt-5 flex flex-wrap gap-2">
              {t.interests.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/70 bg-background/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors group-hover:border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
