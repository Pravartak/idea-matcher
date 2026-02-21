importScripts(
	"https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
	"https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
	apiKey: "AIzaSyBBIiK9E634aaF5lLC21751YbxyOZUXCDY",
	authDomain: "idea-matcher.firebaseapp.com",
	projectId: "idea-matcher",
	messagingSenderId: "1094410865675",
	appId: "1:1094410865675:web:0c8e7b9a3c8d2f1e4b9c",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	console.log("Background message:", payload);

	self.registration.showNotification(payload.notification.title, {
		body: payload.notification.body,
		badge: "/icon.png",
		icon: payload.notification.icon || "/icon.png",
		data: payload.data, // 🔥 VERY IMPORTANT
	});
});

self.addEventListener("notificationclick", function (event) {
	event.notification.close();

	const targetUrl = event.notification.data?.url || "/";

	event.waitUntil(
		clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url.includes(targetUrl) && "focus" in client) {
						return client.focus();
					}
				}
				return clients.openWindow(targetUrl);
			}),
	);
});
