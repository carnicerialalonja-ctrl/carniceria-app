"use client";
import { useEffect, useState } from "react";
import styles from "./admon.module.css";
type State = "loading" | "unsupported" | "off" | "on" | "denied" | "error";
export default function PushToggle() {
  const [state, setState] = useState<State>("loading");
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) { queueMicrotask(() => setState("unsupported")); return; }
    if (Notification.permission === "denied") { queueMicrotask(() => setState("denied")); return; }
    navigator.serviceWorker.register("/push-worker.js").then((registration) => registration.pushManager.getSubscription()).then((subscription) => setState(subscription ? "on" : "off")).catch(() => setState("error"));
  }, []);
  async function toggle() {
    try {
      setState("loading");
      const registration = await navigator.serviceWorker.ready;
      const current = await registration.pushManager.getSubscription();
      if (current) {
        await fetch("/api/admin/push/subscription", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: current.endpoint }) });
        await current.unsubscribe(); setState("off"); return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState(permission === "denied" ? "denied" : "off"); return; }
      const keyResponse = await fetch("/api/admin/push/public-key", { cache: "no-store" });
      const result = await keyResponse.json() as { publicKey?: string; error?: string };
      if (!keyResponse.ok || !result.publicKey) throw new Error(result.error || "Web Push no disponible.");
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(result.publicKey) });
      const saveResponse = await fetch("/api/admin/push/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription.toJSON()) });
      if (!saveResponse.ok) { await subscription.unsubscribe(); throw new Error("No fue posible guardar la suscripción."); }
      setState("on");
    } catch (error) { console.error(error); setState("error"); }
  }
  const labels: Record<State, string> = { loading: "Revisando avisos…", unsupported: "Avisos no compatibles", off: "Activar avisos", on: "Avisos activos", denied: "Avisos bloqueados", error: "Reintentar avisos" };
  return <button type="button" className={state === "on" ? styles.pushOn : styles.pushButton} onClick={() => void toggle()} disabled={state === "loading" || state === "unsupported" || state === "denied"}>{labels[state]}</button>;
}
function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4), base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}
