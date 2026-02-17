import { db, auth } from "@/lib/firebase";
import {
	collection,
	getDocs,
	limit,
	orderBy,
	query,
	where,
} from "firebase/firestore";
import ChatClient from "./ChatsClient";
import { ChatTileProps } from "@/components/chatComponents/ChatComponents";

export default async function Inbox() {
	const viewerUId = auth.currentUser?.uid; // Get the current user's ID
	let initialChats: ChatTileProps[] = [];

	try {
		if (viewerUId) {
			const fallbackQuery = query(
				collection(db, "Conversations"),
				where("members", "array-contains", viewerUId), // Replace with actual user ID
				// orderBy("createdAt", "desc"),
			);
			const fallbackSnap = await getDocs(fallbackQuery);
			initialChats = fallbackSnap.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					name: data.name || "Unknown",
					username: data.username,
					avatar: data.avatar || data.Avatar || data.photoURL || data.profilePic || data.image,
					lastMessage: data.lastMessage,
					timestamp: (data.lastMessageAt || data.createdAt)?.toDate().toISOString() || "",
					unread: data.unread,
					verified: data.verified,
					members: data.members,
				} as ChatTileProps;
			});
		}
	} catch (error) {
		console.error("Error fetching initial chats:", error);
	}
	return <ChatClient initialChats={initialChats} />;
}
