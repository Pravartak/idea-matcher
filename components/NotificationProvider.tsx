"use client";

import { useEffect } from "react";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app, db } from "@/lib/firebase";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";

export default function NotificationProvider({ uid }: { uid: string }) {
	useEffect(() => {
		async function initNotifications() {
			if (!(await isSupported())) return;
			if (!("serviceWorker" in navigator)) return;

			const registration = await navigator.serviceWorker.register(
				"/firebase-messaging-sw.js",
			);

			const firebaseConfig = {
				apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
				authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
				projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
				messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
				appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
			};

			registration.active?.postMessage({
				type: "INIT_FIREBASE",
				config: firebaseConfig,
			});

			try {
				const permission = await Notification.requestPermission();
				if (permission === "granted") {
					const messaging = getMessaging(app);
					const token = await getToken(messaging, {
						vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
					});
					console.log("VAPID_KEY:", process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
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
