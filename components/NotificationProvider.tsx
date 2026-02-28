"use client";

import { useEffect, useState } from "react";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app, db } from "@/lib/firebase";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationProvider() {
	const [user, setUser] = useState<User | null>(null);
	const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

	useEffect(() => {
		const auth = getAuth(app);
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) return;
			setUser(user);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (!user) return;

		const checkPermission = async () => {
			if (!(await isSupported())) return;
			if (!("serviceWorker" in navigator)) return;

			if (Notification.permission === "default") {
				setShowNotificationPrompt(true);
			} else if (Notification.permission === "granted") {
				initNotifications(user.uid);
				setShowNotificationPrompt(false);
			}
		};

		checkPermission();
	}, [user]);

	const initNotifications = async (uid: string) => {
		try {
			const registration = await navigator.serviceWorker.register(
				"/firebase-messaging-sw.js",
			);

			if (!registration.active) {
				await new Promise<void>((resolve) => {
					const serviceWorker = registration.installing || registration.waiting;
					if (!serviceWorker) {
						resolve();
						return;
					}
					const stateChangeListener = () => {
						if (serviceWorker.state === "activated") {
							serviceWorker.removeEventListener(
								"statechange",
								stateChangeListener,
							);
							resolve();
						}
					};
					serviceWorker.addEventListener("statechange", stateChangeListener);
				});
			}

			const messaging = getMessaging(app);
			const token = await getToken(messaging, {
				vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
				serviceWorkerRegistration: registration,
			});
			console.log("Notification permission granted. FCM Token: ", token);

			await updateDoc(doc(db, "users", uid), {
				fcmToken: arrayUnion(token),
			});
		} catch (error) {
			console.error("Error requesting notification permission:", error);
		}
	};

	const handleRequestPermission = async () => {
		if (!user) return;

		try {
			const permission = await Notification.requestPermission();
			if (permission === "granted") {
				await initNotifications(user.uid);
			}
		} catch (error) {
			console.error("Error requesting notification permission:", error);
		} finally {
			setShowNotificationPrompt(false);
		}
	};

	if (!showNotificationPrompt) return null;

	return (
		<div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
			<Card className="shadow-lg">
				<CardHeader className="pb-2">
					<CardTitle className="text-base">Enable Notifications</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-4 text-sm text-muted-foreground">
						Enable notifications to get updates on new matches and messages.
					</p>
					<div className="flex justify-end gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowNotificationPrompt(false)}>
							Later
						</Button>
						<Button size="sm" onClick={handleRequestPermission}>
							Enable
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
