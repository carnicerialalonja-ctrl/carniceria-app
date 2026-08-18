import { sendAdminPush } from "@/lib/push-notifications";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

const ALLOWED_ORIGINS = new Set(["http://localhost:5173", "http://127.0.0.1:5173", "https://quiniela-la-lonja-dist.vercel.app"]);
const QUINIELA_URL = process.env.QUINIELA_SUPABASE_URL ?? "https://knmldlscatfiarlomxzn.supabase.co";
const QUINIELA_KEY = process.env.QUINIELA_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_-UYTJHMwpYYVahiieMbDVw_0Q2SDFMr";
type QuinielaRow = { id: string; folio: string; tipo: string; created_at: string };

function corsHeaders(origin: string | null) {
  return { "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://quiniela-la-lonja-dist.vercel.app", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" };
}
export function OPTIONS(request: Request) { return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) }); }

export async function POST(request: Request) {
  const origin = request.headers.get("origin"), cors = corsHeaders(origin);
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return Response.json({ error: "Origen no permitido." }, { status: 403, headers: cors });
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  const id = String(body?.id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "Identificador no válido." }, { status: 422, headers: cors });
  const response = await fetch(`${QUINIELA_URL}/rest/v1/quinielas?id=eq.${encodeURIComponent(id)}&select=id,folio,tipo,created_at&limit=1`, { cache: "no-store", headers: { apikey: QUINIELA_KEY } });
  const rows = response.ok ? await response.json() as QuinielaRow[] : [];
  const quiniela = rows[0];
  if (!quiniela || Date.now() - new Date(quiniela.created_at).getTime() > 10 * 60 * 1000) return Response.json({ error: "Quiniela no encontrada o fuera de tiempo." }, { status: 404, headers: cors });
  const inserted = await supabaseAdminRequest<{ source_key: string }[]>("notification_events?on_conflict=source_key", { method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=representation" }, body: JSON.stringify({ source_key: `quiniela:${quiniela.id}`, event_type: "quiniela_created" }) });
  if (inserted.length > 0) await sendAdminPush({ title: "Quiniela nueva", body: `${quiniela.folio} · ${quiniela.tipo}`, url: "/admin/admon", tag: `quiniela-${quiniela.id}` });
  return Response.json({ notified: inserted.length > 0 }, { headers: cors });
}
