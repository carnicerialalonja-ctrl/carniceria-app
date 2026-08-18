import { supabaseAdminRequest } from "@/lib/supabase-admin";
import { getOrderHoursStatus } from "@/lib/order-hours";
import { notifyNewOrder } from "@/lib/push-notifications";

type CheckoutItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

type CheckoutRequest = {
  amount: number;
  deliveryMethod?: "DELIVERY" | "PICKUP";
  customer?: { name?: string; phone?: string };
  delivery?: { address?: string; reference?: string; comments?: string };
  items?: CheckoutItem[];
};

type SavedOrder = { id: string };
type ClipCheckoutResponse = {
  payment_request_id?: string;
  payment_request_url?: string;
};

const CLIP_CHECKOUT_URL = "https://api-gw.payclip.com/checkout";

export async function POST(request: Request) {
  const orderHours = getOrderHoursStatus();
  if (!orderHours.isOpen) {
    return Response.json({ error: orderHours.message }, { status: 403 });
  }

  let savedOrderId = "";

  try {
    const apiKey = process.env.CLIP_API_KEY || process.env.Clip_API_KEY;
    const apiSecret = process.env.CLIP_API_SECRET;

    if (!apiKey || !apiSecret) {
      return Response.json({ error: "El pago con Clip todavía no está configurado." }, { status: 503 });
    }

    const body = (await request.json()) as CheckoutRequest;
    const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
    const amount = Number(body.amount);
    const deliveryMethod = body.deliveryMethod;
    const customerName = String(body.customer?.name || "").trim().slice(0, 120);
    const customerPhone = String(body.customer?.phone || "").trim().slice(0, 30);
    const suppliedAddress = String(body.delivery?.address || "").trim().slice(0, 500);
    const deliveryAddress = deliveryMethod === "PICKUP" ? "RECOGER EN TIENDA - Mercado Morelos, local interior 96" : suppliedAddress;
    const deliveryReference = String(body.delivery?.reference || "").trim().slice(0, 500);
    const customerComments = String(body.delivery?.comments || "").trim().slice(0, 1000);

    if (!Number.isFinite(amount) || amount < 1 || amount > 100000 || items.length === 0) {
      return Response.json({ error: "El pedido no contiene un importe válido." }, { status: 400 });
    }

    if (!new Set(["DELIVERY", "PICKUP"]).has(String(deliveryMethod))) {
      return Response.json({ error: "Selecciona una forma válida de entrega." }, { status: 400 });
    }
    if (!customerName || !customerPhone || (deliveryMethod === "DELIVERY" && !deliveryAddress)) {
      return Response.json({ error: "Completa nombre, teléfono y dirección antes de pagar." }, { status: 400 });
    }

    const cleanItems = items.map((item) => ({
      id: String(item.id).slice(0, 50),
      name: String(item.name).slice(0, 100),
      quantity: Number(item.quantity),
      unit: String(item.unit).slice(0, 20),
      unitPrice: Number(item.unitPrice),
    }));
    const calculatedAmount = cleanItems.reduce((sum, item) => {
      if (!Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
        return Number.NaN;
      }
      return sum + item.quantity * item.unitPrice;
    }, 0);

    if (!Number.isFinite(calculatedAmount) || Math.abs(calculatedAmount - amount) > 0.01) {
      return Response.json({ error: "El total cambió. Actualiza la página e inténtalo nuevamente." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const orderReference = `LONJA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const createdOrders = await supabaseAdminRequest<SavedOrder[]>("orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        order_reference: orderReference,
        order_channel: "CLIP",
        clip_status: "CREATING_PAYMENT",
        payment_method: "CLIP",
        delivery_method: deliveryMethod,
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
    savedOrderId = createdOrders[0]?.id || "";
    if (!savedOrderId) throw new Error("Supabase no devolvió el pedido creado.");

    await notifyNewOrder(orderReference, amount, "Clip").catch(() => undefined);
    const itemSummary = cleanItems
      .map((item) => `${item.quantity} ${item.unit} ${item.name}`)
      .join(", ")
      .slice(0, 210);
    const authorization = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`, "utf8").toString("base64")}`;

    const clipResponse = await fetch(CLIP_CHECKOUT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": authorization },
      cache: "no-store",
      body: JSON.stringify({
        amount: Number(amount.toFixed(2)),
        currency: "MXN",
        purchase_description: `Pedido ${orderReference}: ${itemSummary}`.slice(0, 250),
        redirection_url: {
          success: `${origin}/pago/exito`,
          error: `${origin}/pago/error`,
          default: `${origin}/pago/error`,
        },
        webhook_url: `${origin}/api/clip/webhook`,
        metadata: {
          me_reference_id: orderReference,
          customer_info: {
            name: customerName,
            phone: customerPhone.replace(/\D/g, "").slice(0, 15),
          },
        },
        override_settings: {
          payment_method: ["CARD"],
          locale: "es-MX",
          enable_tip: false,
        },
      }),
    });

    const clipData = await clipResponse.json().catch(() => null) as ClipCheckoutResponse | null;
    if (!clipResponse.ok || !clipData?.payment_request_url || !clipData.payment_request_id) {
      await markOrderAsError(savedOrderId);
      const message = clipResponse.status === 401
        ? "Clip rechazó las credenciales configuradas."
        : "Clip no pudo crear el enlace de pago. Inténtalo nuevamente.";
      return Response.json({ error: message }, { status: 502 });
    }

    await supabaseAdminRequest(`orders?id=eq.${encodeURIComponent(savedOrderId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        clip_payment_request_id: clipData.payment_request_id,
        clip_payment_url: clipData.payment_request_url,
        clip_status: "CHECKOUT_CREATED",
        updated_at: new Date().toISOString(),
      }),
    });

    return Response.json({ paymentUrl: clipData.payment_request_url });
  } catch (error) {
    if (savedOrderId) await markOrderAsError(savedOrderId).catch(() => undefined);
    console.error("Error al iniciar Checkout Clip.", error);
    return Response.json({ error: "No fue posible guardar el pedido o conectar con Clip." }, { status: 500 });
  }
}

async function markOrderAsError(orderId: string) {
  return supabaseAdminRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ clip_status: "ERROR", updated_at: new Date().toISOString() }),
  });
}
