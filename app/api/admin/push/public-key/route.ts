import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
export async function GET() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) return Response.json({ error: "Sesión no válida." }, { status: 401 });
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return Response.json({ error: "Web Push no está configurado." }, { status: 503 });
  return Response.json({ publicKey }, { headers: { "Cache-Control": "private, no-store" } });
}
