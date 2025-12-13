"use client";

import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    if(typeof window !== 'undefined') {
      const username = localStorage.getItem("username");

      if(username) {
        router.push("/home");
      }
      return;
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
