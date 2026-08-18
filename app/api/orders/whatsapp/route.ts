import { getOrderHoursStatus } from "@/lib/order-hours";
import { supabaseAdminRequest } from "@/lib/supabase-admin";
import { notifyNewOrder } from "@/lib/push-notifications";

const WHATSAPP = "524613499246";

type OrderItem = { id?: unknown; name?: unknown; quantity?: unknown; unit?: unknown; unitPrice?: unknown };
type OrderBody = {
  amount?: unknown;
  paymentMethod?: unknown;
  deliveryMethod?: unknown;
  customer?: { name?: unknown; phone?: unknown };
  delivery?: { address?: unknown; reference?: unknown; comments?: unknown };
  items?: OrderItem[];
};

type SavedOrder = { id: string; order_reference: string };

export async function POST(request: Request) {
  const orderHours = getOrderHoursStatus();
  if (!orderHours.isOpen) return Response.json({ error: orderHours.message }, { status: 403 });

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  }

  try {
    const body = await request.json() as OrderBody;
    const amount = Number(body.amount);
    const paymentMethod = String(body.paymentMethod || "");
    const deliveryMethod = String(body.deliveryMethod || "");
    const items = Array.isArray(body.items) ? body.items.slice(0, 100) : [];
    const customerName = String(body.customer?.name || "").trim().slice(0, 150);
    const customerPhone = String(body.customer?.phone || "").trim().slice(0, 40);
    const suppliedAddress = String(body.delivery?.address || "").trim().slice(0, 500);
    const deliveryAddress = deliveryMethod === "PICKUP" ? "RECOGER EN TIENDA - Mercado Morelos, local interior 96" : suppliedAddress;
    const deliveryReference = String(body.delivery?.reference || "").trim().slice(0, 500);
    const customerComments = String(body.delivery?.comments || "").trim().slice(0, 1000);

    if (!Number.isFinite(amount) || amount < 1 || amount > 100000 || items.length === 0) {
      return Response.json({ error: "El pedido no contiene un importe válido." }, { status: 400 });
    }
    if (!new Set(["TRANSFER", "CASH_ON_DELIVERY"]).has(paymentMethod) || !new Set(["DELIVERY", "PICKUP"]).has(deliveryMethod)) {
      return Response.json({ error: "Selecciona una forma válida de pago y entrega." }, { status: 400 });
    }
    if (!customerName || !customerPhone || (deliveryMethod === "DELIVERY" && !deliveryAddress)) {
      return Response.json({ error: "Completa nombre, teléfono y dirección antes de enviar." }, { status: 400 });
    }

    const cleanItems = items.map((item) => ({
      id: String(item.id || "").slice(0, 50),
      name: String(item.name || "").trim().slice(0, 100),
      quantity: Number(item.quantity),
      unit: String(item.unit || "").trim().slice(0, 20),
      unitPrice: Number(item.unitPrice),
    }));
    const calculatedAmount = cleanItems.reduce((sum, item) => {
      if (!item.id || !item.name || !item.unit || !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0) return Number.NaN;
      return sum + item.quantity * item.unitPrice;
    }, 0);
    if (!Number.isFinite(calculatedAmount) || Math.abs(calculatedAmount - amount) > .01) {
      return Response.json({ error: "El total cambió. Actualiza la página e inténtalo nuevamente." }, { status: 400 });
    }

    const orderReference = `LONJA-WA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const saved = await supabaseAdminRequest<SavedOrder[]>("orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        order_reference: orderReference,
        order_channel: "WHATSAPP",
        clip_status: "CHECKOUT_PENDING",
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
        fulfillment_status: paymentMethod === "CASH_ON_DELIVERY" && deliveryMethod === "DELIVERY" ? "WAITING_COURIER" : "NEW",
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_reference: deliveryReference || null,
        customer_comments: customerComments || null,
        items: cleanItems,
        amount: Number(amount.toFixed(2)),
        currency: "MXN",
      }),
    });
    if (!saved[0]?.id) throw new Error("Supabase no devolvió el pedido creado.");

    await notifyNewOrder(orderReference, amount, "WhatsApp").catch(() => undefined);
    const productLines = cleanItems.map((item) => `- ${item.name}: ${item.quantity} ${item.unit} = $${money(item.quantity * item.unitPrice)}`).join("\n");
    const deliveryLabel = deliveryMethod === "PICKUP" ? "Recoger en tienda" : "Entrega a domicilio";
    const paymentLabel = paymentMethod === "TRANSFER" ? "Transferencia bancaria" : "Efectivo al recibir";
    const courierNotice = paymentMethod === "CASH_ON_DELIVERY" && deliveryMethod === "DELIVERY"
      ? "\nIMPORTANTE: Entrega sujeta a disponibilidad de repartidor. Espera nuestra confirmación antes de considerar aceptado el pedido."
      : "";
    const message = `Pedido ${orderReference} - Carnicería La Lonja\n\nCliente: ${customerName}\nTeléfono: ${customerPhone}\nForma de entrega: ${deliveryLabel}\nForma de pago: ${paymentLabel}\nDirección: ${deliveryAddress}\nReferencia: ${deliveryReference || "Sin referencia"}\n\nProductos:\n${productLines}\n\nTotal aproximado: $${money(amount)} MXN\nComentarios: ${customerComments || "Sin comentarios"}${courierNotice}\n\nPrecio final sujeto a peso real y disponibilidad.`;
    return Response.json({ orderReference, whatsappUrl: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}` });
  } catch (error) {
    console.error("No fue posible registrar el pedido de WhatsApp.", error);
    return Response.json({ error: "No fue posible registrar el pedido. Inténtalo nuevamente." }, { status: 500 });
  }
}

function money(value: number) {
  return value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
