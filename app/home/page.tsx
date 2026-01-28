import { db } from "@/lib/firebase";
import {
	collection,
	getDocs,
	limit,
	orderBy,
	query,
} from "firebase/firestore";
import FeedClient from "./FeedClient";
import { Post } from "@/components/postComponents/PostComponents";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
	let initialPosts: Post[] = [];

	try {
		const fallbackQuery = query(
			collection(db, "Posts"),
			orderBy("createdAt", "desc"),
			limit(20),
		);
		const fallbackSnap = await getDocs(fallbackQuery);
		initialPosts = fallbackSnap.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				...data,
				// Serialize createdAt to number to avoid serialization issues
				createdAt:
					data.createdAt && typeof data.createdAt.toMillis === "function"
						? data.createdAt.toMillis()
						: data.createdAt?.seconds
						? data.createdAt.seconds * 1000
						: Date.now(),
			};
		}) as unknown as Post[];
	} catch (error) {
		console.error("Error fetching initial posts:", error);
	}

	return <FeedClient initialPosts={initialPosts} />;
}
