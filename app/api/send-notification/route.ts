import { NextResponse } from "next/server";
import { customInitApp } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

export async function POST(req: Request) {
    try {
        customInitApp();
        const { receiverUid, title, body } = await req.json();

        const db = getFirestore();
        const userDoc = await db.collection("users").doc(receiverUid).get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const fcmToken = userDoc.data()?.fcmToken;

        if (!fcmToken) {
            return NextResponse.json({ error: "User does not have an FCM token" }, { status: 400 });
        }

        await getMessaging().send({
            token: fcmToken,
            notification: {
                title,
                body,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
    }
}