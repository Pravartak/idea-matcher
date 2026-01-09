"use client";

import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      router.push("/home");
    }
  }, []);
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
