import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { getCashRegisterData, type CashSession } from "@/lib/cash-register";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

type Body = { action?: unknown; amount?: unknown; movementType?: unknown; reason?: unknown; notes?: unknown; countedAmount?: unknown };

export async function POST(request: Request) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) return Response.json({ error: "Sesión no autorizada." }, { status: 401 });

  try {
    const body = await request.json() as Body;
    const action = String(body.action || "");
    if (action === "OPEN") return openRegister(body);
    if (action === "MOVEMENT") return addMovement(body);
    if (action === "CLOSE") return closeRegister(body);
    return Response.json({ error: "Acción de caja no válida." }, { status: 400 });
  } catch (error) {
    console.error("No fue posible actualizar la caja.", error);
    const message = error instanceof Error && error.message.includes("cash_sessions_one_open_idx") ? "Ya existe una caja abierta." : "No fue posible actualizar la caja.";
    return Response.json({ error: message }, { status: 500 });
  }
}

async function openRegister(body: Body) {
  const current = await getCashRegisterData();
  if (current.openSession) return Response.json({ error: "Ya existe una caja abierta." }, { status: 409 });
  const openingAmount = validMoney(body.amount, true);
  if (openingAmount === null) return Response.json({ error: "Escribe un fondo inicial válido." }, { status: 400 });
  const notes = cleanText(body.notes, 300);
  const created = await supabaseAdminRequest<CashSession[]>("cash_sessions", {
    method: "POST", headers: { Prefer: "return=representation" },
    body: JSON.stringify({ opening_amount: openingAmount, notes }),
  });
  return Response.json({ session: created[0] });
}

async function addMovement(body: Body) {
  const current = await getCashRegisterData();
  if (!current.openSession) return Response.json({ error: "Primero abre la caja." }, { status: 409 });
  const movementType = String(body.movementType || "");
  const amount = validMoney(body.amount, false);
  const reason = cleanText(body.reason, 160);
  if (!new Set(["IN", "OUT"]).has(movementType) || amount === null || reason.length < 2) return Response.json({ error: "Completa el tipo, importe y motivo del movimiento." }, { status: 400 });
  await supabaseAdminRequest("cash_movements", {
    method: "POST", headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ session_id: current.openSession.id, movement_type: movementType, amount, reason }),
  });
  return Response.json({ ok: true });
}

async function closeRegister(body: Body) {
  const current = await getCashRegisterData();
  if (!current.openSession) return Response.json({ error: "No hay una caja abierta." }, { status: 409 });
  const countedAmount = validMoney(body.countedAmount, true);
  if (countedAmount === null) return Response.json({ error: "Escribe el efectivo contado." }, { status: 400 });
  const difference = Math.round((countedAmount - current.expectedCash) * 100) / 100;
  const updated = await supabaseAdminRequest<CashSession[]>(`cash_sessions?id=eq.${current.openSession.id}&status=eq.OPEN`, {
    method: "PATCH", headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status: "CLOSED", closed_at: new Date().toISOString(), counted_amount: countedAmount, expected_amount: current.expectedCash, difference, close_notes: cleanText(body.notes, 300) }),
  });
  if (!updated[0]) return Response.json({ error: "La caja ya había sido cerrada." }, { status: 409 });
  return Response.json({ session: updated[0] });
}

function validMoney(value: unknown, allowZero: boolean) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount > 1000000 || (allowZero ? amount < 0 : amount <= 0)) return null;
  return Math.round(amount * 100) / 100;
}
function cleanText(value: unknown, max: number) { return String(value || "").trim().slice(0, max); }
