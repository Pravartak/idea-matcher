importScripts(
	"https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
	"https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

let messaging;

self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "INIT_FIREBASE") {
		firebase.initializeApp(event.data.config);
		messaging = firebase.messaging();

		messaging.onBackgroundMessage((payload) => {
			console.log(
				"[firebase-messaging-sw.js] Received background message ",
				payload,
			);
			const notificationTitle = payload.notification.title;
			const notificationOptions = {
				body: payload.notification.body,
				icon: "/icon.png", // Replace with your app icon path if you have one
			};

			self.registration.showNotification(
				notificationTitle,
				notificationOptions,
			);
		});
	}
});
