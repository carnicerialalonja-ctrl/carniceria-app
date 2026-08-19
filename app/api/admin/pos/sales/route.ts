import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";
import type { CashSession } from "@/lib/cash-register";
import { getCatalogProducts } from "@/lib/products";

type SaleBody = { paymentMethod?: unknown; cashReceived?: unknown; customerName?: unknown; creditDays?: unknown; transferReference?: unknown; items?: Array<{ id?: unknown; quantity?: unknown; unitPrice?: unknown }> };
type SavedOrder = { id: string; order_reference: string };

export async function POST(request: Request) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) return Response.json({ error: "Sesión no autorizada." }, { status: 401 });

  try {
    const openSessions = await supabaseAdminRequest<CashSession[]>("cash_sessions?select=*&status=eq.OPEN&limit=1");
    const cashSession = openSessions[0];
    if (!cashSession) return Response.json({ error: "Primero abre la caja para registrar ventas." }, { status: 409 });
    const body = await request.json() as SaleBody;
    const paymentMethod = String(body.paymentMethod || "");
    if (!new Set(["CASH", "CARD", "TRANSFER", "CREDIT"]).has(paymentMethod)) return Response.json({ error: "Forma de pago no válida." }, { status: 400 });
    if (!Array.isArray(body.items) || !body.items.length || body.items.length > 100) return Response.json({ error: "La venta no contiene productos." }, { status: 400 });

    const catalog = await getCatalogProducts();
    const productMap = new Map(catalog.map((product) => [product.id, product]));
    const items = body.items.map((item) => {
      const product = productMap.get(String(item.id || ""));
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      if (!product || !Number.isFinite(quantity) || quantity <= 0 || quantity > 1000 || !Number.isFinite(unitPrice) || unitPrice <= 0 || unitPrice > 10000) throw new Error("INVALID_ITEM");
      return { id: product.id, name: product.nombre, quantity, unit: product.unidad, unitPrice, catalogPrice: product.precio };
    });
    const amount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) return Response.json({ error: "El total de la venta no es válido." }, { status: 400 });

    const cashReceived = paymentMethod === "CASH" ? Number(body.cashReceived) : amount;
    if (!Number.isFinite(cashReceived) || cashReceived < amount) return Response.json({ error: "El efectivo recibido es insuficiente." }, { status: 400 });
    const customerName = String(body.customerName || "").trim().slice(0, 120);
    const creditDays = Number(body.creditDays);
    if (paymentMethod === "CREDIT" && (customerName.length < 3 || !Number.isInteger(creditDays) || creditDays < 1 || creditDays > 365)) return Response.json({ error: "Completa el cliente y el plazo del crédito." }, { status: 400 });
    const transferReference = String(body.transferReference || "").trim().slice(0, 80);
    const now = new Date();
    const creditDueAt = paymentMethod === "CREDIT" ? new Date(now.getTime() + creditDays * 86_400_000).toISOString() : null;
    const savedPaymentMethod = paymentMethod === "CASH" ? "CASH_ON_DELIVERY" : paymentMethod === "CARD" ? "CLIP" : paymentMethod;

    const orderReference = `LONJA-POS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const saved = await supabaseAdminRequest<SavedOrder[]>("orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        order_reference: orderReference,
        order_channel: "POS",
        clip_status: paymentMethod === "CREDIT" ? "CHECKOUT_PENDING" : "CHECKOUT_COMPLETED",
        payment_method: savedPaymentMethod,
        delivery_method: "PICKUP",
        fulfillment_status: "DELIVERED",
        customer_name: paymentMethod === "CREDIT" ? customerName : "Venta mostrador",
        customer_phone: "Sin teléfono",
        delivery_address: "VENTA EN MOSTRADOR - Mercado Morelos, local interior 96",
        customer_comments: null,
        internal_notes: [
          paymentMethod === "CASH" ? `POS · Efectivo recibido: ${cashReceived.toFixed(2)}` : paymentMethod === "CARD" ? "POS · Tarjeta aprobada en terminal" : paymentMethod === "TRANSFER" ? `POS · Transferencia recibida${transferReference ? ` · Ref: ${transferReference}` : ""}` : `POS · Crédito a ${creditDays} días · Pendiente de cobro`,
          ...items.filter((item) => Math.abs(item.unitPrice - item.catalogPrice) > .001).map((item) => `Precio editado · ${item.name}: ${item.catalogPrice.toFixed(2)} → ${item.unitPrice.toFixed(2)}`),
        ].join("\n"),
        items: items.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice })),
        amount: Number(amount.toFixed(2)),
        currency: "MXN",
        paid_at: paymentMethod === "CREDIT" ? null : now.toISOString(),
        credit_due_at: creditDueAt,
        credit_status: paymentMethod === "CREDIT" ? "PENDING" : null,
        cash_session_id: cashSession.id,
      }),
    });
    if (!saved[0]?.id) throw new Error("Supabase no devolvió la venta creada.");
    return Response.json({ orderId: saved[0].id, orderReference, change: Number((cashReceived - amount).toFixed(2)) });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ITEM") return Response.json({ error: "Hay un producto o cantidad no válida." }, { status: 400 });
    if (error instanceof Error && error.message.includes("INSUFFICIENT_STOCK:")) {
      const productId = error.message.split("INSUFFICIENT_STOCK:")[1]?.split(/[\s\"\\]/)[0] || "producto";
      return Response.json({ error: `No hay existencia suficiente de ${productId}. Revisa el inventario.` }, { status: 409 });
    }
    console.error("No fue posible registrar la venta POS.", error);
    return Response.json({ error: "No fue posible registrar la venta." }, { status: 500 });
  }
}
