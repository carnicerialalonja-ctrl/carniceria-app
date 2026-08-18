self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = {}; }
  event.waitUntil(self.registration.showNotification(data.title || "Admon La Lonja", {
    body: data.body || "Hay actividad nueva.", icon: "/logo2034pix.png", badge: "/logo2034pix.png",
    tag: data.tag || "admon-update", data: { url: data.url || "/admin/admon" }, renotify: true,
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/admin/admon", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    for (const client of windows) { if ("focus" in client) { client.navigate(target); return client.focus(); } }
    return clients.openWindow(target);
  }));
});
