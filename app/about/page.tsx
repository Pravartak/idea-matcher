import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Users, Target, Zap, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              About IdeaMatcher_
            </h1>
            <p className="font-mono text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto text-balance">
              We're on a mission to help builders find their perfect collaborators and turn ideas into reality.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-lg p-8 md:p-12 border border-border">
              <h2 className="font-mono text-2xl md:text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="font-mono text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                IdeaMatcher was born from a simple observation: the best projects come from teams with aligned visions,
                complementary skills, and shared passion. Yet finding the right collaborators remains one of the biggest
                challenges for students, indie hackers, and builders everywhere.
              </p>
              <p className="font-mono text-muted-foreground text-base md:text-lg leading-relaxed">
                We built IdeaMatcher to solve this problem. Our platform uses intelligent matching to connect you with
                collaborators who share your interests, complement your skills, and align with your project goals.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-mono text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
              What we believe in
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-mono text-lg font-semibold text-foreground">Community First</h3>
                </div>
                <p className="font-mono text-muted-foreground text-sm leading-relaxed">
                  Great things happen when passionate people come together. We foster connections that lead to
                  meaningful collaborations.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-mono text-lg font-semibold text-foreground">Goal Alignment</h3>
                </div>
                <p className="font-mono text-muted-foreground text-sm leading-relaxed">
                  Skills matter, but shared vision matters more. We match based on interests, goals, and project
                  aspirations.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-mono text-lg font-semibold text-foreground">Speed to Ship</h3>
                </div>
                <p className="font-mono text-muted-foreground text-sm leading-relaxed">
                  Finding collaborators shouldn't take months. Our matching helps you connect with the right people in
                  hours, not weeks.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-mono text-lg font-semibold text-foreground">Builder Friendly</h3>
                </div>
                <p className="font-mono text-muted-foreground text-sm leading-relaxed">
                  Built by builders, for builders. We understand the hackathon grind, the side project hustle, and the
                  indie maker journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="font-mono text-3xl md:text-4xl font-bold text-foreground">500+</p>
                <p className="font-mono text-muted-foreground text-sm mt-2">Active Builders</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-3xl md:text-4xl font-bold text-foreground">150+</p>
                <p className="font-mono text-muted-foreground text-sm mt-2">Projects Launched</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-3xl md:text-4xl font-bold text-foreground">48h</p>
                <p className="font-mono text-muted-foreground text-sm mt-2">Avg. Match Time</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-3xl md:text-4xl font-bold text-foreground">92%</p>
                <p className="font-mono text-muted-foreground text-sm mt-2">Match Success Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-mono text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to find your next collaborator?
            </h2>
            <p className="font-mono text-muted-foreground mb-8">
              Join hundreds of builders who've found their perfect match.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-mono font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Start Matching
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
