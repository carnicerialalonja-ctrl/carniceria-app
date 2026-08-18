import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

const ALLOWED_STATUSES = new Set(["NEW", "WAITING_COURIER", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) return Response.json({ error: "Sesión no válida." }, { status: 401 });

  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "Pedido no válido." }, { status: 400 });

  const body = await request.json().catch(() => null) as { fulfillment_status?: string; internal_notes?: string } | null;
  if (!body) return Response.json({ error: "Datos no válidos." }, { status: 400 });

  const update: Record<string, string | null> = { updated_at: new Date().toISOString() };
  if (body.fulfillment_status !== undefined) {
    if (!ALLOWED_STATUSES.has(body.fulfillment_status)) return Response.json({ error: "Estado no válido." }, { status: 400 });
    update.fulfillment_status = body.fulfillment_status;
    update.fulfillment_updated_at = new Date().toISOString();
  }
  if (body.internal_notes !== undefined) {
    const notes = body.internal_notes.trim();
    if (notes.length > 1000) return Response.json({ error: "La nota es demasiado larga." }, { status: 400 });
    update.internal_notes = notes || null;
  }
  if (Object.keys(update).length === 1) return Response.json({ error: "No hay cambios para guardar." }, { status: 400 });

  try {
    const rows = await supabaseAdminRequest<Record<string, unknown>[]>(`orders?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(update),
    });
    if (!rows[0]) return Response.json({ error: "No se encontró el pedido." }, { status: 404 });
    return Response.json({ order: rows[0] });
  } catch (error) {
    console.error("No fue posible actualizar el pedido.", error);
    return Response.json({ error: "No fue posible guardar el cambio." }, { status: 500 });
  }
}
