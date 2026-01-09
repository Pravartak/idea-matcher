// lib/firebase-admin.ts
import { cert, getApps, initializeApp } from "firebase-admin/app";

export function customInitApp() {
	// Initialize the app only if it's not already initialized
	if (getApps().length <= 0) {
		// Your service account key file contents should be stored in an environment variable.
		const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

		if (!serviceAccountKey) {
			throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing");
		}

		const serviceAccount = JSON.parse(serviceAccountKey);

		initializeApp({
			credential: cert(serviceAccount),
		});
	}
}