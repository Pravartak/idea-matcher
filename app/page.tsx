import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}
