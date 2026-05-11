self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "",
    icon: data.icon || "/images/badge-icon.png",
    badge: "/images/badge-icon.png",
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [{ action: "open", title: "View" }],
  };

  event.waitUntil(self.registration.showNotification(data.title || "BallersAdda", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/profile"));
});
