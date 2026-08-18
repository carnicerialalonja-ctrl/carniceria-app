import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { getInventoryMovements } from "@/lib/inventory";
import type { ProductRow } from "@/lib/products";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

type InventoryBody = { productId?: unknown; quantity?: unknown; kind?: unknown; note?: unknown };
const kinds = new Set(["STOCK_ENTRY", "WASTE", "CORRECTION"]);

export async function GET() {
  if (!await authorized()) return Response.json({ error: "Sesión no autorizada." }, { status: 401 });
  return Response.json(await getInventoryMovements());
}

export async function POST(request: Request) {
  if (!await authorized()) return Response.json({ error: "Sesión no autorizada." }, { status: 401 });
  try {
    const body = await request.json() as InventoryBody;
    const productId = String(body.productId || "").trim().toUpperCase();
    const kind = String(body.kind || "").trim().toUpperCase();
    const quantity = Number(body.quantity);
    const note = String(body.note || "").trim().slice(0, 300);
    if (!/^[A-Z0-9_-]{2,40}$/.test(productId)) return Response.json({ error: "Producto no válido." }, { status: 400 });
    if (!kinds.has(kind)) return Response.json({ error: "Tipo de movimiento no válido." }, { status: 400 });
    if (!Number.isFinite(quantity) || quantity < -1000000 || quantity > 1000000 || (kind !== "CORRECTION" && quantity <= 0)) {
      return Response.json({ error: "Escribe una cantidad válida." }, { status: 400 });
    }
    const product = await supabaseAdminRequest<ProductRow>("rpc/adjust_product_inventory", {
      method: "POST",
      body: JSON.stringify({ p_product_id: productId, p_quantity: Math.round(quantity * 1000) / 1000, p_kind: kind, p_note: note || null }),
    });
    const movements = await getInventoryMovements(1);
    return Response.json({ product, movement: movements[0] });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    if (detail.includes("STOCK_TRACKING_DISABLED")) return Response.json({ error: "Primero activa el control de existencia para este producto." }, { status: 409 });
    if (detail.includes("INSUFFICIENT_STOCK:")) return Response.json({ error: "El ajuste dejaría existencia negativa y este producto tiene bloqueo activo." }, { status: 409 });
    if (detail.includes("PRODUCT_NOT_FOUND")) return Response.json({ error: "Producto no encontrado." }, { status: 404 });
    console.error("No fue posible ajustar el inventario.", error);
    return Response.json({ error: "No fue posible guardar el movimiento." }, { status: 500 });
  }
}

async function authorized() { return isAdminTokenValid((await cookies()).get(ADMIN_COOKIE)?.value); }
