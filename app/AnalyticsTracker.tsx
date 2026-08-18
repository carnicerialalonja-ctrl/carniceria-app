"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function identifier(storage: Storage, key: string) {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  storage.setItem(key, value);
  return value;
}

function track(eventName: "session_start" | "page_view") {
  const anonymousId = identifier(localStorage, "lonja_analytics_visitor");
  const sessionId = identifier(sessionStorage, "lonja_analytics_session");
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project: "carniceria",
      eventName,
      anonymousId,
      sessionId,
      pageUrl: window.location.href,
      referrer: document.referrer,
    }),
    keepalive: true,
  }).catch(() => undefined);
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const sessionKey = "lonja_carniceria_session_started";
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "1");
      track("session_start");
    }
    track("page_view");
  }, [pathname]);

  return null;
}
