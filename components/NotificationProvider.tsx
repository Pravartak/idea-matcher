"use client";

import { useEffect } from "react";

export default function NotificationProvider() {
	useEffect(() => {
		async function initNotifications() {
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
		}

		initNotifications();
	}, []);

	return null;
}
