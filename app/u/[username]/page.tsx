// app/u/[username]/page.tsx

import { doc, getDoc, } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";
import { User } from "@/components/types/user";
import ProfileViewServer from "@/components/profile/ProfileViewServer";

export default async function PublicProfile({ params }: { params: { username: string }; }) {
	const { username } = await params;
    console.log("PUBLIC PROFILE USERNAME:", username);

    if(!username){
        return notFound();
    }

	const userDoc = await getDoc(doc(db, "users", username));

	if (!userDoc.exists()) {
		return notFound();
	}

	const userData = userDoc.data() as User["user"];

	if (!userData) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<p>No profile found</p>
			</div>
		);
	}

	return <ProfileViewServer user={userData} userid={username} isOwner={false} />;
}
