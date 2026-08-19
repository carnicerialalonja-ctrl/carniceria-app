import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { getCashRegisterData } from "@/lib/cash-register";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

type Body = { orderId?: unknown; paymentMethod?: unknown; reference?: unknown };
type Settlement = { order_reference: string; amount: number; received_at: string };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) return Response.json({ error: "Sesión no autorizada." }, { status: 401 });

  try {
    const body = await request.json() as Body;
    const orderId = String(body.orderId || "").trim();
    const paymentMethod = String(body.paymentMethod || "").trim();
    const reference = String(body.reference || "").trim().slice(0, 80);
    if (!UUID_PATTERN.test(orderId) || !new Set(["CASH", "TRANSFER"]).has(paymentMethod)) return Response.json({ error: "Los datos del pago no son válidos." }, { status: 400 });

    const cashSession = paymentMethod === "CASH" ? (await getCashRegisterData()).openSession : null;
    if (paymentMethod === "CASH" && !cashSession) return Response.json({ error: "Abre la caja antes de recibir este pago en efectivo." }, { status: 409 });

    const settled = await supabaseAdminRequest<Settlement[]>("rpc/settle_credit_order", {
      method: "POST",
      body: JSON.stringify({ p_order_id: orderId, p_payment_method: paymentMethod, p_reference: reference || null, p_cash_session_id: cashSession?.id || null }),
    });
    if (!settled[0]?.order_reference) throw new Error("La base no devolvió el crédito liquidado.");
    return Response.json({ settlement: settled[0] });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    if (detail.includes("CREDIT_NOT_PENDING") || detail.includes("credit_payments_order_id_key")) return Response.json({ error: "Este crédito ya fue pagado o dejó de estar pendiente." }, { status: 409 });
    if (detail.includes("OPEN_CASH_SESSION_REQUIRED")) return Response.json({ error: "Abre la caja antes de recibir el pago en efectivo." }, { status: 409 });
    console.error("No fue posible liquidar el crédito.", error);
    return Response.json({ error: "No fue posible registrar el pago del crédito." }, { status: 500 });
  }
}
