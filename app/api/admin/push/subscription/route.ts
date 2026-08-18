import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";
type SubscriptionBody = { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
async function authorized() { return isAdminTokenValid((await cookies()).get(ADMIN_COOKIE)?.value); }
function sameOrigin(request: Request) { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; }
export async function POST(request: Request) {
  if (!(await authorized())) return Response.json({ error: "Sesión no válida." }, { status: 401 });
  if (!sameOrigin(request)) return Response.json({ error: "Origen no permitido." }, { status: 403 });
  const body = await request.json().catch(() => null) as SubscriptionBody | null;
  const endpoint = String(body?.endpoint ?? "").slice(0, 2000), p256dh = String(body?.keys?.p256dh ?? "").slice(0, 500), authKey = String(body?.keys?.auth ?? "").slice(0, 500);
  if (!endpoint.startsWith("https://") || !p256dh || !authKey) return Response.json({ error: "Suscripción no válida." }, { status: 422 });
  await supabaseAdminRequest("push_subscriptions?on_conflict=endpoint", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ endpoint, p256dh, auth_key: authKey, user_agent: request.headers.get("user-agent"), updated_at: new Date().toISOString() }) });
  return new Response(null, { status: 204 });
}
export async function DELETE(request: Request) {
  if (!(await authorized())) return Response.json({ error: "Sesión no válida." }, { status: 401 });
  if (!sameOrigin(request)) return Response.json({ error: "Origen no permitido." }, { status: 403 });
  const body = await request.json().catch(() => null) as { endpoint?: unknown } | null;
  const endpoint = String(body?.endpoint ?? "").slice(0, 2000);
  if (!endpoint.startsWith("https://")) return Response.json({ error: "Suscripción no válida." }, { status: 422 });
  await supabaseAdminRequest(`push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
  return new Response(null, { status: 204 });
}
