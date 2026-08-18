import { getAdmonDashboardData } from "@/lib/admon-data";
import { sendAdminPush } from "@/lib/push-notifications";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const inserted = await supabaseAdminRequest<{ source_key: string }[]>(
    "notification_events?on_conflict=source_key",
    {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ source_key: `daily-summary:${day}`, event_type: "daily_summary" }),
    }
  );

  if (inserted.length === 0) {
    return Response.json({ ok: true, skipped: "already_sent" });
  }

  const data = await getAdmonDashboardData();
  const sessions = (data.carniceria.sessionsToday ?? 0) + (data.reproductor.sessionsToday ?? 0) + (data.quiniela.sessionsToday ?? 0);
  const body = [
    `${data.carniceria.ordersToday} pedidos (${formatMoney(data.carniceria.salesToday)})`,
    `${data.quiniela.entriesToday} quinielas`,
    `${data.reproductor.playsToday ?? 0} reproducciones`,
    `${data.reproductor.purchaseClicksToday ?? 0} clics de compra`,
    `${sessions} sesiones`,
  ].join(" · ");

  const result = await sendAdminPush({
    title: "Resumen diario de Admon",
    body,
    url: "/admin/admon",
    tag: `daily-summary-${day}`,
  });

  return Response.json({ ok: true, sent: result.sent });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}
