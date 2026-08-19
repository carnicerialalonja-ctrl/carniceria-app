import { supabaseAdminRequest } from "@/lib/supabase-admin";

export type CashSession = {
  id: number;
  status: "OPEN" | "CLOSED";
  opening_amount: number | string;
  opened_at: string;
  closed_at: string | null;
  counted_amount: number | string | null;
  expected_amount: number | string | null;
  difference: number | string | null;
  notes: string;
  close_notes: string;
};

export type CashMovement = {
  id: number;
  session_id: number;
  movement_type: "IN" | "OUT";
  amount: number | string;
  reason: string;
  created_at: string;
};

type PosOrder = { payment_method: string; amount: number | string; fulfillment_status: string; created_at: string; credit_status: string | null };
type CreditCashPayment = { amount: number | string };

export type CashRegisterData = {
  openSession: CashSession | null;
  sessions: CashSession[];
  movements: CashMovement[];
  cashSales: number;
  cardSales: number;
  transferSales: number;
  creditSales: number;
  cashOperations: number;
  cardOperations: number;
  transferOperations: number;
  creditOperations: number;
  moneyIn: number;
  moneyOut: number;
  expectedCash: number;
};

export async function getCashRegisterData(): Promise<CashRegisterData> {
  const sessions = await supabaseAdminRequest<CashSession[]>("cash_sessions?select=*&order=opened_at.desc&limit=30");
  const openSession = sessions.find((session) => session.status === "OPEN") || null;
  if (!openSession) return { openSession: null, sessions, movements: [], cashSales: 0, cardSales: 0, transferSales: 0, creditSales: 0, cashOperations: 0, cardOperations: 0, transferOperations: 0, creditOperations: 0, moneyIn: 0, moneyOut: 0, expectedCash: 0 };

  const [movements, orders, creditCashPayments] = await Promise.all([
    supabaseAdminRequest<CashMovement[]>(`cash_movements?select=*&session_id=eq.${openSession.id}&order=created_at.desc`),
    supabaseAdminRequest<PosOrder[]>(`orders?select=payment_method,amount,fulfillment_status,created_at,credit_status&order_channel=eq.POS&cash_session_id=eq.${openSession.id}&order=created_at.desc&limit=2000`),
    supabaseAdminRequest<CreditCashPayment[]>(`credit_payments?select=amount&payment_method=eq.CASH&cash_session_id=eq.${openSession.id}&limit=2000`),
  ]);
  const validOrders = orders.filter((order) => order.fulfillment_status !== "CANCELLED");
  const cashOrders = validOrders.filter((order) => order.payment_method === "CASH_ON_DELIVERY");
  const cardOrders = validOrders.filter((order) => order.payment_method === "CLIP");
  const transferOrders = validOrders.filter((order) => order.payment_method === "TRANSFER");
  const creditOrders = validOrders.filter((order) => order.payment_method === "CREDIT" && order.credit_status === "PENDING");
  const creditCashReceived = sum(creditCashPayments.map((payment) => payment.amount));
  const cashSales = sum(cashOrders.map((order) => order.amount)) + creditCashReceived;
  const cardSales = sum(cardOrders.map((order) => order.amount));
  const transferSales = sum(transferOrders.map((order) => order.amount));
  const creditSales = sum(creditOrders.map((order) => order.amount));
  const moneyIn = sum(movements.filter((movement) => movement.movement_type === "IN").map((movement) => movement.amount));
  const moneyOut = sum(movements.filter((movement) => movement.movement_type === "OUT").map((movement) => movement.amount));

  return {
    openSession,
    sessions,
    movements,
    cashSales,
    cardSales,
    transferSales,
    creditSales,
    cashOperations: cashOrders.length + creditCashPayments.length,
    cardOperations: cardOrders.length,
    transferOperations: transferOrders.length,
    creditOperations: creditOrders.length,
    moneyIn,
    moneyOut,
    expectedCash: round(Number(openSession.opening_amount) + cashSales + moneyIn - moneyOut),
  };
}

function sum(values: Array<number | string>) { return round(values.reduce<number>((total, value) => total + Number(value || 0), 0)); }
function round(value: number) { return Math.round(value * 100) / 100; }
