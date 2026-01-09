// app/u/[username]/page.tsx

import {
	collection,
	getDocs,
	getDoc,
	doc,
	query,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";
import { User } from "@/components/types/user";
import ProfileViewServer from "@/components/profile/ProfileViewServer";
import ProfileActions from "@/components/profile/ProfileActions";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { customInitApp } from "@/lib/firebase-admin";
import RedirectToSignup from "@/components/RedirectToSignup";

// const user = userData as User["user"];

export default async function PublicProfile({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;
	const decodedUsername = decodeURIComponent(username);

	// It's recommended to have a helper function to initialize the admin app
	// to prevent re-initialization during hot-reloads in development.
	customInitApp();

	// 1. Get the logged-in user's UID from the session cookie
	let loggedInUserUid: string | null = null;
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get("session")?.value;

	if (sessionCookie) {
		try {
			const decodedClaims = await getAuth().verifySessionCookie(
				sessionCookie,
				true
			);
			loggedInUserUid = decodedClaims.uid;
		} catch (e) {
			// Session cookie is invalid, treat as logged out.
			loggedInUserUid = null;
		}
	}

	console.log("PUBLIC PROFILE USERNAME:", decodedUsername);

	if (!decodedUsername) {
		return notFound();
	}

	// This is a more robust way to find a user by their username.
	// It queries the 'users' collection for a document where the 'username' field matches.
	const usersRef = collection(db, "users");
	const userQuery = query(usersRef, where("username", "==", decodedUsername));
	const userQuerySnapshot = await getDocs(userQuery);

	let userData: User["user"] | null = null;

	if (!userQuerySnapshot.empty) {
		userData = userQuerySnapshot.docs[0].data() as User["user"];
	} else {
		// Fallback: Try to fetch by document ID (UID) if username query fails
		// This supports URLs that use the UID instead of the username
		const userDocRef = doc(db, "users", decodedUsername);
		const userDocSnap = await getDoc(userDocRef);
		if (userDocSnap.exists()) {
			userData = userDocSnap.data() as User["user"];
		}
	}

	if (!userData) {
		if (!loggedInUserUid) {
			return <RedirectToSignup />;
		}
		return notFound();
	}

	// 2. The public profile user's UID is in the fetched document data
	const publicUserUid = userData.uid;

	const postsQuery = query(
		collection(db, "Posts"),
		// FIX: Use the public user's UID to fetch their posts, not their username.
		where("authorUid", "==", publicUserUid)
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

	// 3. Determine if the logged-in user is the owner of the profile
	const isOwner = loggedInUserUid === publicUserUid;

	return (
		<>
			<ProfileViewServer user={userData} posts={postsData} isOwner={isOwner} />
			<ProfileActions
				targetUid={publicUserUid}
				viewerUid={loggedInUserUid}
			/>
		</>
	);
}
