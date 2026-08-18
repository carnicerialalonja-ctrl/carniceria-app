import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) {
    return Response.json({ error: "Sesión no válida." }, { status: 401 });
  }

  try {
    const orders = await supabaseAdminRequest(
      "orders?select=*&order=created_at.desc&limit=100"
    );
    return Response.json(
      { orders },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("No fue posible actualizar la lista de pedidos.", error);
    return Response.json({ error: "No fue posible actualizar los pedidos." }, { status: 500 });
  }
}
