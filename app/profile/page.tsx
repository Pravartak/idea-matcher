// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProfileView from "@/components/profile/ProfileView";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function MyProfilePage() {
	const [username, setUsername] = useState<string | null>(null);
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

			async function loadUser() {
				const q = query(
					collection(db, "users"),
					where("firebaseUid", "==", auth.currentUser?.uid)
				);

				const snap = await getDocs(q);

				if (snap.empty) {
					router.push("/onboarding/profile");
					return;
				}
				const docSnap = snap.docs[0];
				setUserData(docSnap.data());

				setUsername(docSnap.id);
				setLoading(false);

				localStorage.setItem("username", docSnap.id);
			}
			loadUser();
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

	return <ProfileView user={userData} userid={username} isOwner={true} />;
}
