// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import {
	arrayUnion,
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	updateDoc,
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

	const requestNotificationPermission = async (uid: string) => {
		if (!("Notification" in window)) return;
		try {
			const permission = await Notification.requestPermission();
			if (permission === "granted") {
				const messaging = getMessaging();
				const token = await getToken(messaging, {
					vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
				})
				console.log("Notification permission granted. FCM Token: ", token);

				await updateDoc(doc(db, "users", uid), {
					fcmToken: arrayUnion(token),
				});
			} else {
				console.log("Notification permission denied.");
			}
		} catch (error) {
			console.error("Error requesting notification permission:", error);
		}
	};

	useEffect(() => {
		const auth = getAuth();

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				router.push("/signup");
				return;
			}

			requestNotificationPermission(user.uid);

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
