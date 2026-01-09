"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RedirectToSignup() {
	const router = useRouter();

	useEffect(() => {
		toast.error("User not found. Redirecting to signup...");
		const timer = setTimeout(() => {
			router.push("/signup");
		}, 3000);

		return () => clearTimeout(timer);
	}, [router]);

	return (
		<div className="flex h-screen w-full items-center justify-center">
			<p>Please login before visiting this profile. Redirecting to signup in 3 seconds...</p>
		</div>
	);
}