import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { quinielaAdminRequest } from "@/lib/quiniela-admin";

export const dynamic = "force-dynamic";

type Jornada = { id:string; nombre:string; estatus:string; activa:boolean; fecha_cierre:string|null; external_league_id:number|null; external_season:number|null; resultados_actualizados_at:string|null; generacion_error:string|null; generacion_actualizada_at:string|null; created_at:string };
type Partido = { id:string; jornada_id:string; resultado:string|null; estado_api:string|null };

async function authorized() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return isAdminTokenValid(token);
}

async function getState() {
  const jornadas = await quinielaAdminRequest<Jornada[]>("jornadas?select=id,nombre,estatus,activa,fecha_cierre,external_league_id,external_season,resultados_actualizados_at,generacion_error,generacion_actualizada_at,created_at&order=created_at.desc&limit=12");
  const ids = jornadas.map((item) => item.id);
  const partidos = ids.length ? await quinielaAdminRequest<Partido[]>(`partidos?select=id,jornada_id,resultado,estado_api&jornada_id=in.(${ids.join(",")})&order=created_at.asc`) : [];
  const counts = new Map<string, { total:number; finalizados:number }>();
  for (const partido of partidos) {
    const value = counts.get(partido.jornada_id) ?? { total:0, finalizados:0 };
    value.total += 1;
    if (partido.estado_api === "FT" && partido.resultado) value.finalizados += 1;
    counts.set(partido.jornada_id, value);
  }
  return { jornadas:jornadas.map((jornada) => ({ ...jornada, partidos:counts.get(jornada.id)?.total ?? 0, finalizados:counts.get(jornada.id)?.finalizados ?? 0 })) };
}

export async function GET() {
  if (!(await authorized())) return Response.json({ error:"Sesión no válida." }, { status:401 });
  try { return Response.json(await getState(), { headers:{ "Cache-Control":"private, no-store" } }); }
  catch (error) { return Response.json({ error:error instanceof Error ? error.message : "No fue posible leer la Quiniela." }, { status:500 }); }
}

export async function POST(request: Request) {
  if (!(await authorized())) return Response.json({ error:"Sesión no válida." }, { status:401 });
  try {
    const body = await request.json() as { action?:string };
    if (body.action === "generate") await generateNextRound();
    else throw new Error("Acción de Quiniela no reconocida.");
    return Response.json(await getState());
  } catch (error) { return Response.json({ error:error instanceof Error ? error.message : "No fue posible ejecutar el control." }, { status:400 }); }
}

async function generateNextRound() {
  const drafts = await quinielaAdminRequest<Jornada[]>("jornadas?select=id,nombre,estatus,activa,fecha_cierre,external_league_id,external_season,resultados_actualizados_at,generacion_error,generacion_actualizada_at,created_at&estatus=eq.Borrador&order=created_at.desc&limit=1");
  if (drafts.length) throw new Error(`${drafts[0].nombre} ya está en preparación. Pulsa Revisar ahora.`);
  const [latest] = await quinielaAdminRequest<Jornada[]>("jornadas?select=id,nombre,estatus,activa,fecha_cierre,external_league_id,external_season,resultados_actualizados_at,generacion_error,generacion_actualizada_at,created_at&order=created_at.desc&limit=1");
  const currentNumber = Number(latest?.nombre.match(/Jornada\s+(\d+)/i)?.[1] ?? 0);
  const nextNumber = currentNumber + 1;
  const baseName = latest?.nombre?.replace(/Jornada\s+\d+/i, `Jornada ${nextNumber}`) ?? `Liga MX - Jornada ${nextNumber}`;
  const existing = await quinielaAdminRequest<Array<{id:string}>>(`jornadas?select=id&nombre=eq.${encodeURIComponent(baseName)}&limit=1`);
  if (existing.length) throw new Error(`${baseName} ya existe.`);
  await quinielaAdminRequest("jornadas", { method:"POST", headers:{ Prefer:"return=minimal" }, body:JSON.stringify({ nombre:baseName, fecha_cierre:null, estatus:"Borrador", activa:false, external_league_id:latest?.external_league_id ?? 262, external_season:latest?.external_season ?? new Date().getFullYear(), generacion_error:null, generacion_actualizada_at:new Date().toISOString() }) });
}
