"use client";

import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
// import NotificationProvider from "@/components/NotificationProvider";

export default function Page() {
	const router = useRouter();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				router.push("/home");
			}
		});
		return () => unsubscribe();
	}, [router]);
	return (
		<>
			{/* <NotificationProvider /> */}
			<Navbar />
			<main>
				<Hero />
				<Testimonials />
			</main>
			<Footer />
		</>
	);
}
