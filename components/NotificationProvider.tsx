"use client";

import { useEffect } from "react";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app, db } from "@/lib/firebase";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { publicEnv } from "@/lib/publicEnv";

export default function NotificationProvider() {
	useEffect(() => {
		async function initNotifications() {
			if (!(await isSupported())) return;
			if (!("serviceWorker" in navigator)) return;
			await navigator.serviceWorker.register("/firebase-messaging-sw.js");

			try {
				const permission = await Notification.requestPermission();
				if (permission === "granted") {

					const auth = getAuth();
					const user = auth.currentUser;
					if (!user) return;
					const uid = user.uid;

					const messaging = getMessaging(app);
					const token = await getToken(messaging, {
						vapidKey: publicEnv.vapidKey,
					});
					console.log("VAPID_KEY:", publicEnv.vapidKey);
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
		}

		initNotifications();
	}, []);

	return null;
}
