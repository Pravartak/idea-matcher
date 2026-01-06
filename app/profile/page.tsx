// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProfileView from "@/components/profile/ProfileView";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function MyProfilePage() {
	// const [username, setUsername] = useState<string | null>(null);
	const [userData, setUserData] = useState<any>();
	const [loading, setLoading] = useState(true);
	const [postsData, setPostsData] = useState<any[]>([]);
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

			try {
				const q = query(
					collection(db, "Posts"),
					where("authorUid", "==", user.uid)
				);
				const querySnapshot = await getDocs(q);
				const fetchedPosts = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				fetchedPosts.sort(
					(a: any, b: any) =>
						(b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
				);
				setPostsData(fetchedPosts);
				console.log(fetchedPosts);
			} catch (error) {
				console.error("Error fetching posts:", error);
			}

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

	return <ProfileView user={userData} isOwner={true} posts={postsData} />;
}
