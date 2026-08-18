import { supabaseAdminRequest } from "@/lib/supabase-admin";

type ClipWebhook = { payment_request_id?: string; id?: string };
type ClipStatus = {
  payment_request_id?: string;
  status?: string;
  receipt_no?: string | null;
  modified_at?: string;
};

const ALLOWED_STATUSES = new Set([
  "CHECKOUT_CREATED",
  "CHECKOUT_PENDING",
  "CHECKOUT_COMPLETED",
  "CHECKOUT_CANCELLED",
  "CHECKOUT_EXPIRED",
]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ClipWebhook;
    const paymentRequestId = String(payload.payment_request_id || payload.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(paymentRequestId)) {
      return Response.json({ received: true });
    }

    const apiKey = process.env.CLIP_API_KEY || process.env.Clip_API_KEY;
    const apiSecret = process.env.CLIP_API_SECRET;
    if (!apiKey || !apiSecret) return Response.json({ error: "Clip no configurado." }, { status: 503 });

    const authorization = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`, "utf8").toString("base64")}`;
    const statusResponse = await fetch(`https://api-gw.payclip.com/checkout/${paymentRequestId}`, {
      headers: { "x-api-key": authorization },
      cache: "no-store",
    });
    const clipStatus = await statusResponse.json().catch(() => null) as ClipStatus | null;

    if (!statusResponse.ok || !clipStatus?.status || !ALLOWED_STATUSES.has(clipStatus.status)) {
      return Response.json({ error: "No fue posible validar el estado con Clip." }, { status: 502 });
    }

    const update: Record<string, string | null> = {
      clip_status: clipStatus.status,
      receipt_no: clipStatus.receipt_no || null,
      updated_at: new Date().toISOString(),
    };
    if (clipStatus.status === "CHECKOUT_COMPLETED") {
      update.paid_at = clipStatus.modified_at || new Date().toISOString();
    }

    await supabaseAdminRequest(`orders?clip_payment_request_id=eq.${encodeURIComponent(paymentRequestId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(update),
    });

    return Response.json({ received: true });
  } catch (error) {
    console.error("Error procesando webhook de Clip.", error);
    return Response.json({ error: "Error interno." }, { status: 500 });
  }
}
