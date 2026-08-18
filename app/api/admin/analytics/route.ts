import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) {
    return Response.json({ error: "Sesión no válida." }, { status: 401 });
  }

  const since = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
  try {
    const orders = await supabaseAdminRequest(
      `orders?select=id,created_at,clip_status,fulfillment_status,amount,items&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=2000`
    );
    return Response.json(
      { orders },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("No fue posible cargar las estadísticas.", error);
    return Response.json({ error: "No fue posible cargar las estadísticas." }, { status: 500 });
  }
}
