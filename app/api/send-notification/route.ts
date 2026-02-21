import { NextResponse } from "next/server";
import { customInitApp } from "@/lib/firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

export async function POST(req: Request) {
	try {
		customInitApp();
		const { receiverUid, title, body } = await req.json();

		const db = getFirestore();
		const userDoc = await db.collection("users").doc(receiverUid).get();

		if (!userDoc.exists) {
			console.error("User not found with UID:", receiverUid);
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const userData = userDoc.data();
		const fcmTokens = userData?.fcmToken;

		if (!fcmTokens || !Array.isArray(fcmTokens) || fcmTokens.length === 0) {
			return NextResponse.json(
				{ error: "User does not have an FCM token" },
				{ status: 400 },
			);
		}

		const response = await getMessaging().sendEachForMulticast({
			tokens: fcmTokens,
			notification: {
				title,
				body,
			},
		});
		console.log("Success:", response.successCount);
		console.log("Failure:", response.failureCount);
		console.log(response.responses);

		response.responses.forEach((res, idx) => {
			console.log("Token:", fcmTokens[idx]);
			console.log("Result:", res);
		});

		if (response.failureCount > 0) {
			const tokensToRemove: string[] = [];
			response.responses.forEach((res, idx) => {
				if (!res.success) {
					tokensToRemove.push(fcmTokens[idx]);
				}
			});

			if (tokensToRemove.length > 0) {
				await db
					.collection("users")
					.doc(receiverUid)
					.update({
						fcmToken: FieldValue.arrayRemove(...tokensToRemove),
					});
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error sending notification:", error);
		return NextResponse.json(
			{ error: "Failed to send notification" },
			{ status: 500 },
		);
	}
}
