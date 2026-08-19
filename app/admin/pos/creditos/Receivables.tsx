"use client";

import { useMemo, useState } from "react";
import styles from "./creditos.module.css";

type SaleItem = { name?: string; quantity?: number; unit?: string };
export type CreditSale = { id: string; order_reference: string; customer_name: string; amount: number | string; created_at: string; credit_due_at: string | null; credit_status: "PENDING" | "PAID" | "CANCELLED" | null; items?: SaleItem[] };
export type CreditPayment = { id: string; order_id: string; payment_method: "CASH" | "TRANSFER"; amount: number | string; reference: string | null; received_at: string };

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const date = new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", dateStyle: "medium" });

export default function Receivables({ initialSales, payments }: { initialSales: CreditSale[]; payments: CreditPayment[] }) {
  const [filter, setFilter] = useState<"PENDING" | "PAID" | "ALL">("PENDING");
  const [selected, setSelected] = useState<CreditSale | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"TRANSFER" | "CASH">("TRANSFER");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const pending = initialSales.filter((sale) => sale.credit_status === "PENDING");
  const overdue = pending.filter(isOverdue);
  const pendingTotal = sum(pending);
  const visible = useMemo(() => initialSales.filter((sale) => filter === "ALL" || sale.credit_status === filter), [filter, initialSales]);
  const paymentByOrder = new Map(payments.map((payment) => [payment.order_id, payment]));

  async function settle() {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/admin/pos/receivables", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: selected.id, paymentMethod, reference }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "No fue posible registrar el pago.");
      window.location.reload();
    } catch (settleError) {
      setError(settleError instanceof Error ? settleError.message : "No fue posible registrar el pago.");
      setSaving(false);
    }
  }

  return <main className={styles.shell}>
    <header className={styles.header}><div><span>CUENTAS POR COBRAR</span><h1>Créditos</h1><p>Controla ventas pendientes y registra cuando llegue el pago.</p></div><nav><a href="/admin/pos">← Regresar al POS</a><a href="/admin/pos/corte">Corte del día</a><button onClick={() => window.location.reload()}>Actualizar</button></nav></header>
    <section className={styles.summary}><article><span>SALDO PENDIENTE</span><strong>{money.format(pendingTotal)}</strong><small>{pending.length} créditos</small></article><article className={overdue.length ? styles.alert : ""}><span>VENCIDOS</span><strong>{money.format(sum(overdue))}</strong><small>{overdue.length} cuentas</small></article><article><span>COBRADOS</span><strong>{money.format(sum(initialSales.filter((sale) => sale.credit_status === "PAID")))}</strong><small>{initialSales.filter((sale) => sale.credit_status === "PAID").length} pagos</small></article></section>
    <section className={styles.listCard}><div className={styles.listHead}><div><span>CLIENTES</span><h2>Movimientos a crédito</h2></div><div className={styles.filters}><button className={filter === "PENDING" ? styles.active : ""} onClick={() => setFilter("PENDING")}>Pendientes</button><button className={filter === "PAID" ? styles.active : ""} onClick={() => setFilter("PAID")}>Pagados</button><button className={filter === "ALL" ? styles.active : ""} onClick={() => setFilter("ALL")}>Todos</button></div></div>
      <div className={styles.sales}>{visible.length ? visible.map((sale) => { const payment = paymentByOrder.get(sale.id); return <article key={sale.id} className={isOverdue(sale) && sale.credit_status === "PENDING" ? styles.overdue : ""}><div className={styles.client}><strong>{sale.customer_name}</strong><small>{sale.order_reference} · Venta {date.format(new Date(sale.created_at))}</small><small>{sale.credit_status === "PENDING" ? `Vence ${sale.credit_due_at ? date.format(new Date(sale.credit_due_at)) : "sin fecha"}` : payment ? `Pagó ${payment.payment_method === "TRANSFER" ? "por transferencia" : "en efectivo"} · ${date.format(new Date(payment.received_at))}` : "Pagado"}</small></div><span>{(sale.items || []).length} productos</span><b>{money.format(Number(sale.amount))}</b>{sale.credit_status === "PENDING" ? <button onClick={() => { setSelected(sale); setError(""); setReference(""); }}>Registrar pago</button> : <em>✓ Pagado</em>}</article>; }) : <p className={styles.empty}>No hay cuentas en esta sección.</p>}</div>
    </section>
    {selected && <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className={styles.modal} role="dialog" aria-modal="true"><button className={styles.close} onClick={() => setSelected(null)}>×</button><span>LIQUIDAR CRÉDITO</span><h2>{selected.customer_name}</h2><strong className={styles.amount}>{money.format(Number(selected.amount))}</strong><div className={styles.methods}><button className={paymentMethod === "TRANSFER" ? styles.active : ""} onClick={() => setPaymentMethod("TRANSFER")}>🏦 Transferencia</button><button className={paymentMethod === "CASH" ? styles.active : ""} onClick={() => setPaymentMethod("CASH")}>💵 Efectivo</button></div>{paymentMethod === "TRANSFER" && <label>Referencia (opcional)<input value={reference} onChange={(event) => setReference(event.target.value)} maxLength={80} placeholder="Folio, banco o últimos dígitos" /></label>}{paymentMethod === "CASH" && <p className={styles.notice}>El importe se agregará al efectivo esperado de la caja abierta.</p>}{error && <p className={styles.error}>{error}</p>}<button className={styles.confirm} disabled={saving} onClick={() => void settle()}>{saving ? "Guardando…" : "Confirmar pago completo"}</button></section></div>}
  </main>;
}

function isOverdue(sale: CreditSale) { return Boolean(sale.credit_due_at && new Date(sale.credit_due_at).getTime() < Date.now()); }
function sum(sales: CreditSale[]) { return sales.reduce((total, sale) => total + Number(sale.amount || 0), 0); }
