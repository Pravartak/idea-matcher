import { getFirestore } from "firebase-admin/firestore";
import { notFound } from "next/navigation";
import { User } from "@/components/types/user";
import ChatPage from "@/components/chatInterface/Chat";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { customInitApp } from "@/lib/firebase-admin";

export default async function Chat({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const { userId } = await params;
	const decodedUserId = decodeURIComponent(userId);

	customInitApp();

	// 1. Get the logged-in user's UID from the session cookie
	let loggedInUserUid: string | null = null;
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get("session")?.value;

	if (sessionCookie) {
		try {
			const decodedClaims = await getAuth().verifySessionCookie(
				sessionCookie,
				true,
			);
			loggedInUserUid = decodedClaims.uid;
		} catch (e) {
			// Session cookie is invalid, treat as logged out.
			loggedInUserUid = null;
		}
	}

	console.log("Chat userId:", decodedUserId);

	if (!decodedUserId) {
		return notFound();
	}

	// This is a more robust way to find a user by their username.
	// It queries the 'users' collection for a document where the 'username' field matches.
	const db = getFirestore();
	const usersRef = db.collection("users");
	const userQuerySnapshot = await usersRef.where("username", "==", decodedUserId).get();

	let userData: User["user"] | null = null;

	if (!userQuerySnapshot.empty) {
		userData = userQuerySnapshot.docs[0].data() as User["user"];
	} else {
		// Fallback: Try to fetch by document ID (UID) if username query fails
		// This supports URLs that use the UID instead of the username
		const userDocSnap = await usersRef.doc(decodedUserId).get();
		if (userDocSnap.exists) {
			userData = userDocSnap.data() as User["user"];
		}
	}

	if (!userData) {
		return notFound();
	}

	// 2. The user's UID is in the fetched document data
	const chatUserUid = userData.uid;
	if (!chatUserUid) return notFound();

	// 3. Fetch messages for the conversation between the logged-in user and the chat user
	// Assuming you have a "Conversations" collection where each document ID is a combination of the two user UIDs

	let messagesData: any[] = [];

	if (loggedInUserUid) {
		const conversationId = [loggedInUserUid, chatUserUid].sort().join("_");
		const messagesRef = db.collection("Conversations").doc(conversationId).collection("Messages");
		const messagesSnap = await messagesRef.orderBy("createdAt", "asc").limit(100).get();

		messagesData = messagesSnap.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})).sort((a: any, b: any) => {
			const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
			const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
			return aTime - bTime;
		}); // Ensure messages are sorted by creation time
	}

	// 3. Determine if the logged-in user is the owner of the profile
	const isOwner = loggedInUserUid === userData.uid;

	return (
		<ChatPage targetUser={userData} messages={messagesData} isOwner={isOwner} ></ChatPage>
	)
}
