importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyBBIiK9E634aaF5lLC21751YbxyOZUXCDY",
  authDomain: "idea-matcher.firebaseapp.com",
  projectId: "idea-matcher",
  storageBucket: "idea-matcher.firebasestorage.com",
  messagingSenderId: "888281953245",
  appId: "1:888281953245:web:279bbf8ede7e7ca55c3c34",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png' // Replace with your app icon path if you have one
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});