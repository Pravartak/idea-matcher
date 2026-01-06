// app/u/[username]/page.tsx

import {
	doc,
	getDoc,
	collection,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";
import { User } from "@/components/types/user";
import ProfileViewServer from "@/components/profile/ProfileViewServer";

export default async function PublicProfile({
	params,
}: {
	params: { username: string };
}) {
	const { username } = await params;
	console.log("PUBLIC PROFILE USERNAME:", username);

	if (!username) {
		return notFound();
	}

	const userDoc = await getDoc(doc(db, "users", username));

	if (!userDoc.exists()) {
		return notFound();
	}

	const userData = userDoc.data() as User["user"];

	const postsQuery = query(
		collection(db, "Posts"),
		where("authorUid", "==", username)
	);

	const postsSnap = await getDocs(postsQuery);

	const postsData = postsSnap.docs
		.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}))
		.sort((a: any, b: any) => {
			const aTime = a.createdAt?.seconds ?? 0;
			const bTime = b.createdAt?.seconds ?? 0;
			return bTime - aTime;
		});

	if (!userData) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<p>No profile found</p>
			</div>
		);
	}

	return (
		<ProfileViewServer user={userData} posts={postsData} isOwner={false} />
	);
}
