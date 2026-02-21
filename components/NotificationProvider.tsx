"use client";

import { useEffect } from "react";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app, db } from "@/lib/firebase";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function NotificationProvider() {
	useEffect(() => {
		const auth = getAuth(app);

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) return;

			const initNotifications = async (uid: string) => {
				if (!(await isSupported())) return;
				if (!("serviceWorker" in navigator)) return;
				const registration = await navigator.serviceWorker.register(
					"/firebase-messaging-sw.js",
				);

				try {
					const permission = await Notification.requestPermission();
					if (permission === "granted") {
						const messaging = getMessaging(app);
						const token = await getToken(messaging, {
							vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
							serviceWorkerRegistration: registration,
						});
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
			};

			initNotifications(user.uid);
		});

		return () => unsubscribe();
	}, []);

	return null;
}
