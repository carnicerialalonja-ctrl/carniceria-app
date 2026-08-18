import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { getProducts, type ProductRow } from "@/lib/products";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

type ProductBody = { id?: unknown; name?: unknown; category?: unknown; price?: unknown; unit?: unknown; description?: unknown; imageUrl?: unknown; emoji?: unknown; isActive?: unknown; trackStock?: unknown; stockQuantity?: unknown; lowStockThreshold?: unknown; blockOutOfStock?: unknown };

export async function GET() {
  if (!await authorized()) return Response.json({ error: "Sesión no autorizada." }, { status: 401 });
  return Response.json(await getProducts(true));
}

export async function POST(request: Request) {
  if (!await authorized()) return Response.json({ error: "Sesión no autorizada." }, { status: 401 });
  try {
    const values = validate(await request.json() as ProductBody, true);
    const current = await getProducts(true);
    const saved = await supabaseAdminRequest<ProductRow[]>("products", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...values, sort_order: current.length }) });
    return Response.json(saved[0], { status: 201 });
  } catch (error) { return productError(error); }
}

export async function PATCH(request: Request) {
  if (!await authorized()) return Response.json({ error: "Sesión no autorizada." }, { status: 401 });
  try {
    const body = await request.json() as ProductBody;
    const id = productId(body.id);
    const values = validate(body, false);
    const saved = await supabaseAdminRequest<ProductRow[]>(`products?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...values, updated_at: new Date().toISOString() }) });
    if (!saved[0]) return Response.json({ error: "Producto no encontrado." }, { status: 404 });
    return Response.json(saved[0]);
  } catch (error) { return productError(error); }
}

async function authorized() { return isAdminTokenValid((await cookies()).get(ADMIN_COOKIE)?.value); }
function productId(value: unknown) {
  const id = String(value || "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{2,40}$/.test(id)) throw new Error("El código debe tener entre 2 y 40 letras, números, guiones o guion bajo.");
  return id;
}
function text(value: unknown, label: string, min: number, max: number) {
  const result = String(value || "").trim();
  if (result.length < min || result.length > max) throw new Error(`${label} debe tener entre ${min} y ${max} caracteres.`);
  return result;
}
function validate(body: ProductBody, includeId: boolean) {
  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0 || price > 1000000) throw new Error("Escribe un precio válido.");
  const imageUrl = String(body.imageUrl || "").trim();
  if (imageUrl && !imageUrl.startsWith("/") && !/^https:\/\//i.test(imageUrl)) throw new Error("La imagen debe usar una dirección https:// o una ruta interna.");
  const trackStock = body.trackStock === true;
  const stockQuantity = body.stockQuantity === "" || body.stockQuantity === null || body.stockQuantity === undefined ? null : Number(body.stockQuantity);
  const lowStockThreshold = body.lowStockThreshold === "" || body.lowStockThreshold === null || body.lowStockThreshold === undefined ? 1 : Number(body.lowStockThreshold);
  if (trackStock && (!Number.isFinite(stockQuantity) || Number(stockQuantity) < -1000000 || Number(stockQuantity) > 1000000)) throw new Error("Escribe una existencia válida.");
  if (!Number.isFinite(lowStockThreshold) || lowStockThreshold < 0 || lowStockThreshold > 1000000) throw new Error("Escribe un aviso de existencia baja válido.");
  return {
    ...(includeId ? { id: productId(body.id) } : {}),
    name: text(body.name, "El nombre", 2, 120), category: text(body.category, "La categoría", 2, 50),
    price: Math.round(price * 100) / 100, unit: text(body.unit, "La unidad", 1, 30),
    description: String(body.description || "").trim().slice(0, 600), image_url: imageUrl.slice(0, 1000),
    emoji: String(body.emoji || "📦").trim().slice(0, 16) || "📦", is_active: body.isActive !== false,
    track_stock: trackStock, stock_quantity: trackStock ? Math.round(Number(stockQuantity) * 1000) / 1000 : null,
    low_stock_threshold: Math.round(lowStockThreshold * 1000) / 1000,
    block_out_of_stock: trackStock && body.blockOutOfStock === true,
  };
}
function productError(error: unknown) {
  const detail = error instanceof Error ? error.message : "No fue posible guardar el producto.";
  if (detail.includes("duplicate key") || detail.includes("products_pkey")) return Response.json({ error: "Ya existe un producto con ese código." }, { status: 409 });
  const safe = detail.startsWith("Supabase respondió") ? "No fue posible guardar el producto." : detail;
  return Response.json({ error: safe }, { status: 400 });
}
