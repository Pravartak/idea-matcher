importScripts(
	"https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
	"https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
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

	self.registration.showNotification(
		payload.notification?.title || payload.data?.title,
		{
			body: payload.notification?.body || payload.data?.body,
			icon: payload.notification?.icon || "/favicon.ico",
			badge: payload.notification?.badge || "/favicon.ico",
			data: payload.data,
		},
	);
	console.log("Notification displayed");
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
				if (clients.openWindow) {
					return clients.openWindow(targetUrl);
				}
			}),
	);
});
