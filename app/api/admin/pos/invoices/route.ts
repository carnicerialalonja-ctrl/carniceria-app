import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

type InvoiceBody = {
  orderId?: unknown;
  rfc?: unknown;
  legalName?: unknown;
  postalCode?: unknown;
  taxRegime?: unknown;
  cfdiUse?: unknown;
  email?: unknown;
};

type PosOrder = {
  id: string;
  order_reference: string;
  order_channel: string;
  payment_method: string;
  amount: number;
  currency: string;
  items: unknown;
  paid_at: string | null;
};

type InvoiceRequest = { id: string; status: string };
type InvoiceUpdateBody = { invoiceRequestId?: unknown; uuid?: unknown; satFolio?: unknown; notes?: unknown };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
const TAX_REGIMES = new Set(["601", "603", "605", "606", "608", "610", "611", "612", "614", "615", "616", "621", "625", "626"]);
const CFDI_USES = new Set(["G01", "G02", "G03", "I01", "I02", "I03", "I04", "I05", "I06", "I07", "I08", "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "S01", "CP01", "CN01"]);

export async function POST(request: Request) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) return Response.json({ error: "Sesión no autorizada." }, { status: 401 });

  try {
    const body = await request.json() as InvoiceBody;
    const orderId = String(body.orderId || "").trim();
    const rfc = String(body.rfc || "").trim().toUpperCase();
    const legalName = String(body.legalName || "").trim().toUpperCase();
    const postalCode = String(body.postalCode || "").trim();
    const taxRegime = String(body.taxRegime || "").trim();
    const cfdiUse = String(body.cfdiUse || "").trim().toUpperCase();
    const email = String(body.email || "").trim().toLowerCase();

    if (!UUID_PATTERN.test(orderId)) return Response.json({ error: "La venta no es válida." }, { status: 400 });
    if (!RFC_PATTERN.test(rfc)) return Response.json({ error: "Revisa el RFC: debe llevar 12 o 13 caracteres." }, { status: 400 });
    if (legalName.length < 3 || legalName.length > 200) return Response.json({ error: "Escribe el nombre o razón social tal como aparece en la constancia fiscal." }, { status: 400 });
    if (!/^\d{5}$/.test(postalCode)) return Response.json({ error: "El código postal fiscal debe tener 5 números." }, { status: 400 });
    if (!TAX_REGIMES.has(taxRegime)) return Response.json({ error: "Selecciona un régimen fiscal válido." }, { status: 400 });
    if (!CFDI_USES.has(cfdiUse)) return Response.json({ error: "Selecciona un uso de CFDI válido." }, { status: 400 });
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) return Response.json({ error: "Revisa el correo electrónico." }, { status: 400 });

    const orders = await supabaseAdminRequest<PosOrder[]>(`orders?select=id,order_reference,order_channel,payment_method,amount,currency,items,paid_at&id=eq.${encodeURIComponent(orderId)}&limit=1`);
    const order = orders[0];
    if (!order || order.order_channel !== "POS") return Response.json({ error: "No encontré una venta POS con ese folio." }, { status: 404 });

    const paymentForm = order.payment_method === "CASH_ON_DELIVERY" ? "01" : order.payment_method === "CLIP" ? "04" : order.payment_method === "TRANSFER" ? "03" : order.payment_method === "CREDIT" ? "99" : null;
    const fiscalPaymentMethod = order.payment_method === "CREDIT" ? "PPD" : "PUE";
    if (!paymentForm) return Response.json({ error: "La forma de pago de esta venta no se puede facturar todavía." }, { status: 409 });

    const saved = await supabaseAdminRequest<InvoiceRequest[]>("invoice_requests", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        order_id: order.id,
        order_reference: order.order_reference,
        rfc,
        legal_name: legalName,
        postal_code: postalCode,
        tax_regime: taxRegime,
        cfdi_use: cfdiUse,
        email: email || null,
        payment_form: paymentForm,
        payment_method: fiscalPaymentMethod,
        amount: Number(order.amount),
        currency: order.currency,
        sale_snapshot: {
          orderReference: order.order_reference,
          paymentMethod: order.payment_method,
          paidAt: order.paid_at,
          items: order.items,
        },
      }),
    });
    if (!saved[0]?.id) throw new Error("Supabase no devolvió la solicitud fiscal creada.");
    return Response.json({ invoiceRequestId: saved[0].id, status: saved[0].status });
  } catch (error) {
    if (error instanceof Error && (error.message.includes("duplicate key") || error.message.includes("23505"))) {
      return Response.json({ error: "Esta venta ya tiene una solicitud de factura." }, { status: 409 });
    }
    console.error("No fue posible guardar la solicitud fiscal.", error);
    return Response.json({ error: "No fue posible guardar los datos fiscales." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) return Response.json({ error: "Sesión no autorizada." }, { status: 401 });

  try {
    const body = await request.json() as InvoiceUpdateBody;
    const invoiceRequestId = String(body.invoiceRequestId || "").trim();
    const fiscalUuid = String(body.uuid || "").trim().toUpperCase();
    const satFolio = String(body.satFolio || "").trim().slice(0, 80);
    const notes = String(body.notes || "").trim().slice(0, 300);
    if (!UUID_PATTERN.test(invoiceRequestId)) return Response.json({ error: "La solicitud de factura no es válida." }, { status: 400 });
    if (!UUID_PATTERN.test(fiscalUuid)) return Response.json({ error: "Copia el UUID fiscal completo de 36 caracteres." }, { status: 400 });

    const updated = await supabaseAdminRequest<InvoiceRequest[]>(`invoice_requests?id=eq.${encodeURIComponent(invoiceRequestId)}&status=eq.PENDING_SAT`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: "INVOICED", fiscal_uuid: fiscalUuid, sat_folio: satFolio || null, admin_notes: notes || null, stamped_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
    });
    if (!updated[0]?.id) return Response.json({ error: "Esta solicitud ya fue facturada o dejó de estar pendiente." }, { status: 409 });
    return Response.json({ invoice: updated[0] });
  } catch (error) {
    if (error instanceof Error && (error.message.includes("duplicate key") || error.message.includes("23505"))) return Response.json({ error: "Ese UUID fiscal ya está registrado." }, { status: 409 });
    console.error("No fue posible marcar la factura.", error);
    return Response.json({ error: "No fue posible actualizar la factura." }, { status: 500 });
  }
}
