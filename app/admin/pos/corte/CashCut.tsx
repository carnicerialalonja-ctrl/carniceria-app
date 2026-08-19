"use client";

import styles from "./corte.module.css";

type SaleItem = { name?: string; quantity?: number; unit?: string };

export type PosSale = {
  id: string;
  order_reference: string;
  payment_method: "CASH_ON_DELIVERY" | "CLIP" | string;
  amount: number | string;
  created_at: string;
  fulfillment_status: string;
  items?: SaleItem[];
};

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" });
const longDate = new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", dateStyle: "full" });
const time = new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", hour: "2-digit", minute: "2-digit" });

export default function CashCut({ initialSales }: { initialSales: PosSale[] }) {
  const now = new Date();
  const today = dayKey.format(now);
  const sales = initialSales.filter((sale) => sale.fulfillment_status !== "CANCELLED" && dayKey.format(new Date(sale.created_at)) === today);
  const cashSales = sales.filter((sale) => sale.payment_method === "CASH_ON_DELIVERY");
  const cardSales = sales.filter((sale) => sale.payment_method === "CLIP");
  const transferSales = sales.filter((sale) => sale.payment_method === "TRANSFER");
  const creditSales = sales.filter((sale) => sale.payment_method === "CREDIT");
  const cash = sum(cashSales);
  const card = sum(cardSales);
  const transfer = sum(transferSales);
  const credit = sum(creditSales);
  const total = sum(sales);
  const average = sales.length ? total / sales.length : 0;

  return <main className={styles.shell}>
    <header className={styles.header}>
      <div><span>CORTE DEL DÍA</span><h1>Corte de caja</h1><p>{capitalize(longDate.format(now))}</p></div>
      <nav className={styles.actions}>
        <a href="/admin/pos">← Regresar al POS</a>
        <button type="button" onClick={() => window.location.reload()}>Actualizar</button>
        <button type="button" className={styles.print} onClick={() => window.print()}>Imprimir corte</button>
      </nav>
    </header>

    <section className={styles.summary}>
      <article className={styles.total}><span>VENTA TOTAL</span><strong>{money.format(total)}</strong><small>{sales.length} operaciones</small></article>
      <article><span>💵 EFECTIVO</span><strong>{money.format(cash)}</strong><small>{cashSales.length} cobros</small></article>
      <article><span>💳 TARJETA</span><strong>{money.format(card)}</strong><small>{cardSales.length} cobros</small></article>
      <article><span>🏦 TRANSFERENCIA</span><strong>{money.format(transfer)}</strong><small>{transferSales.length} cobros</small></article>
      <article><span>🕐 POR COBRAR</span><strong>{money.format(credit)}</strong><small>{creditSales.length} créditos</small></article>
      <article><span>TICKET PROMEDIO</span><strong>{money.format(average)}</strong><small>por operación</small></article>
    </section>

    <section className={styles.detail}>
      <div className={styles.detailHead}><div><span>MOVIMIENTOS</span><h2>Ventas de hoy</h2></div><b>{sales.length}</b></div>
      {sales.length ? <div className={styles.sales}>{sales.map((sale) => <article key={sale.id}>
        <div><strong>{sale.order_reference}</strong><small>{time.format(new Date(sale.created_at))} · {paymentLabel(sale.payment_method)}</small></div>
        <span>{(sale.items || []).length} productos</span>
        <b>{money.format(Number(sale.amount))}</b>
      </article>)}</div> : <p className={styles.empty}>Todavía no hay ventas registradas hoy en el Punto de Venta.</p>}
    </section>

    <footer className={styles.ticketFooter}>
      <strong>LA LONJA</strong><span>Corte de caja · {longDate.format(now)}</span><span>Impreso: {new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}</span>
    </footer>
  </main>;
}

function sum(sales: PosSale[]) { return sales.reduce((total, sale) => total + Number(sale.amount || 0), 0); }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
function paymentLabel(method: string) { return method === "CASH_ON_DELIVERY" ? "Efectivo" : method === "CLIP" ? "Tarjeta" : method === "TRANSFER" ? "Transferencia" : method === "CREDIT" ? "Crédito pendiente" : method; }
