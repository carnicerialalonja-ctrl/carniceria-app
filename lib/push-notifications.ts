import "server-only";
import webpush from "web-push";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

type StoredSubscription = { endpoint: string; p256dh: string; auth_key: string };
type PushMessage = { title: string; body: string; url: string; tag: string };

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function sendAdminPush(message: PushMessage) {
  if (!configureWebPush()) return { sent: 0, unavailable: true };
  const subscriptions = await supabaseAdminRequest<StoredSubscription[]>("push_subscriptions?select=endpoint,p256dh,auth_key&limit=100").catch(() => []);
  let sent = 0;
  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth_key } }, JSON.stringify(message), { TTL: 300, urgency: "high" });
      sent += 1;
    } catch (error) {
      const statusCode = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 0;
      if (statusCode === 404 || statusCode === 410) {
        await supabaseAdminRequest(`push_subscriptions?endpoint=eq.${encodeURIComponent(subscription.endpoint)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }).catch(() => undefined);
      } else console.error("No fue posible enviar una notificación push.", error);
    }
  }));
  return { sent, unavailable: false };
}

export async function notifyNewOrder(reference: string, amount: number, channel: string) {
  await sendAdminPush({ title: "Pedido nuevo en La Lonja", body: `${reference} · $${amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} · ${channel}`, url: "/admin/pedidos", tag: `order-${reference}` });
}

export async function notifyPurchaseClick(destination: string) {
  await sendAdminPush({
    title: "Interés de compra en el Reproductor",
    body: `Una persona hizo clic para comprar por ${destination}.`,
    url: "/admin/admon",
    tag: `reproductor-compra-${destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  });
}
