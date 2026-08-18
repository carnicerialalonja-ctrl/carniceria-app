import { supabaseAdminRequest } from "@/lib/supabase-admin";
import { notifyPurchaseClick } from "@/lib/push-notifications";

export const dynamic = "force-dynamic";

const PROJECTS = new Set(["carniceria", "reproductor", "quiniela"]);
const EVENTS = new Set(["page_view", "session_start", "play", "purchase_click"]);
const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://la-lonja-celaya-oficial.vercel.app",
  "https://la-lonja-music-station.vercel.app",
  "https://quiniela-la-lonja-dist.vercel.app",
  "https://quiniela-la-lonja.vercel.app",
];

function allowedOrigins() {
  return new Set([
    ...DEFAULT_ORIGINS,
    ...(process.env.ANALYTICS_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]);
}

function corsHeaders(origin: string | null) {
  const allowed = origin && allowedOrigins().has(origin) ? origin : DEFAULT_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);
  if (origin && !allowedOrigins().has(origin)) {
    return Response.json({ error: "Origen no permitido." }, { status: 403, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Evento no válido." }, { status: 400, headers });
  }

  const project = String(body.project ?? "");
  const eventName = String(body.eventName ?? "");
  const anonymousId = String(body.anonymousId ?? "").slice(0, 100);
  const sessionId = String(body.sessionId ?? "").slice(0, 100);
  if (!PROJECTS.has(project) || !EVENTS.has(eventName) || anonymousId.length < 8 || sessionId.length < 8) {
    return Response.json({ error: "Evento no permitido." }, { status: 422, headers });
  }

  const rawMetadata = body.metadata;
  const metadata = rawMetadata && typeof rawMetadata === "object" && !Array.isArray(rawMetadata)
    ? Object.fromEntries(Object.entries(rawMetadata).slice(0, 12).map(([key, value]) => [key.slice(0, 40), String(value).slice(0, 120)]))
    : {};

  try {
    await supabaseAdminRequest("analytics_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        project,
        event_name: eventName,
        anonymous_id: anonymousId,
        session_id: sessionId,
        page_url: String(body.pageUrl ?? "").slice(0, 500) || null,
        referrer: String(body.referrer ?? "").slice(0, 500) || null,
        user_agent: String(request.headers.get("user-agent") ?? "").slice(0, 500) || null,
        metadata,
      }),
    });

    if (project === "reproductor" && eventName === "purchase_click") {
      const destination = String(metadata.destination ?? "La Lonja").slice(0, 80);
      const tenMinuteBucket = Math.floor(Date.now() / (10 * 60 * 1000));
      const sourceKey = `reproductor:${sessionId}:${destination}:${tenMinuteBucket}`;
      const inserted = await supabaseAdminRequest<{ source_key: string }[]>(
        "notification_events?on_conflict=source_key",
        {
          method: "POST",
          headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
          body: JSON.stringify({ source_key: sourceKey, event_type: "reproductor_purchase_click" }),
        }
      ).catch(() => []);
      if (inserted.length > 0) await notifyPurchaseClick(destination);
    }
    return new Response(null, { status: 204, headers });
  } catch (error) {
    console.error("No fue posible registrar el evento de analítica.", error);
    return Response.json({ error: "Analítica no disponible." }, { status: 503, headers });
  }
}
