// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProfileView from "@/components/profile/ProfileView";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { setUserId } from "firebase/analytics";

export default function MyProfilePage() {
	// const [username, setUsername] = useState<string | null>(null);
	const [userData, setUserData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const auth = getAuth();

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				router.push("/signup");
				return;
			}

			const docRef = doc(db, "users", user.uid);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) {
				router.push("/onboarding/profile");
				return;
			}

			// setUserId(user.uid);
			setUserData(docSnap.data());
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	if (loading) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<p>Loading...</p>
			</div>
		);
	}
	if (!userData) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<p>No profile found</p>
			</div>
		);
	}

	return <ProfileView user={userData} isOwner={true} />;
}
