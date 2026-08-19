"use client";

import { useMemo, useState } from "react";
import styles from "./facturas.module.css";

type SaleItem = { name?: string; quantity?: number; unit?: string; unitPrice?: number };
export type InvoiceRequest = { id: string; order_id: string; order_reference: string; status: "PENDING_SAT" | "INVOICED" | "CANCELLED" | "ERROR"; rfc: string; legal_name: string; postal_code: string; tax_regime: string; cfdi_use: string; email: string | null; payment_form: string; payment_method: string; amount: number | string; sale_snapshot: { items?: SaleItem[]; paidAt?: string }; fiscal_uuid: string | null; sat_folio: string | null; admin_notes: string | null; stamped_at: string | null; created_at: string };
export type InvoiceOrder = { id: string; payment_method: string; credit_status: string | null; credit_due_at: string | null; paid_at: string | null };

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const dateTime = new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", dateStyle: "medium", timeStyle: "short" });

export default function InvoiceQueue({ initialRequests, orders }: { initialRequests: InvoiceRequest[]; orders: InvoiceOrder[] }) {
  const [filter, setFilter] = useState<"PENDING_SAT" | "INVOICED" | "ALL">("PENDING_SAT");
  const [selected, setSelected] = useState<InvoiceRequest | null>(null);
  const [uuid, setUuid] = useState("");
  const [folio, setFolio] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const visible = useMemo(() => initialRequests.filter((item) => filter === "ALL" || item.status === filter), [filter, initialRequests]);
  const orderById = new Map(orders.map((order) => [order.id, order]));
  const pending = initialRequests.filter((item) => item.status === "PENDING_SAT");

  async function copyData(request: InvoiceRequest) {
    const order = orderById.get(request.order_id);
    const items = (request.sale_snapshot.items || []).map((item) => `${item.quantity || 0} ${item.unit || ""} · ${item.name || "Producto"} · ${money.format(Number(item.unitPrice || 0))}`).join("\n");
    const text = [`Folio de venta: ${request.order_reference}`, `RFC: ${request.rfc}`, `Nombre/Razón social: ${request.legal_name}`, `CP fiscal: ${request.postal_code}`, `Régimen: ${request.tax_regime}`, `Uso CFDI: ${request.cfdi_use}`, `Método: ${request.payment_method}`, `Forma de pago: ${request.payment_form}`, `Total: ${money.format(Number(request.amount))}`, `Cobro: ${order?.payment_method === "CREDIT" ? order.credit_status === "PAID" ? "Crédito liquidado" : "Crédito pendiente" : "Pagado"}`, "", "Conceptos:", items].join("\n");
    await navigator.clipboard.writeText(text);
    setMessage(`Datos de ${request.order_reference} copiados.`);
    window.setTimeout(() => setMessage(""), 2200);
  }

  async function markInvoiced() {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/admin/pos/invoices", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceRequestId: selected.id, uuid, satFolio: folio, notes }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "No fue posible actualizar la factura.");
      window.location.reload();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "No fue posible actualizar la factura.");
      setSaving(false);
    }
  }

  return <main className={styles.shell}>
    <header className={styles.header}><div><span>CONTROL FISCAL</span><h1>Facturables</h1><p>Datos preparados para facturar gratuitamente en el portal del SAT.</p></div><nav><a href="/admin/pos">← Regresar al POS</a><a href="/admin/pos/creditos">Cuentas por cobrar</a><a href="https://www.sat.gob.mx/personas/factura-electronica" target="_blank" rel="noreferrer">Abrir SAT ↗</a></nav></header>
    <section className={styles.summary}><article><span>PENDIENTES EN SAT</span><strong>{pending.length}</strong><small>{money.format(sum(pending))}</small></article><article><span>FACTURADAS</span><strong>{initialRequests.filter((item) => item.status === "INVOICED").length}</strong><small>Con UUID registrado</small></article><article><span>CRÉDITOS SIN COBRAR</span><strong>{pending.filter((item) => orderById.get(item.order_id)?.credit_status === "PENDING").length}</strong><small>La factura y el cobro se controlan por separado</small></article></section>
    {message && <p className={styles.toast}>{message}</p>}
    <section className={styles.queue}><div className={styles.queueHead}><div><span>SOLICITUDES</span><h2>Facturas</h2></div><div className={styles.filters}><button className={filter === "PENDING_SAT" ? styles.active : ""} onClick={() => setFilter("PENDING_SAT")}>Pendientes</button><button className={filter === "INVOICED" ? styles.active : ""} onClick={() => setFilter("INVOICED")}>Facturadas</button><button className={filter === "ALL" ? styles.active : ""} onClick={() => setFilter("ALL")}>Todas</button></div></div><div className={styles.rows}>{visible.length ? visible.map((request) => { const order = orderById.get(request.order_id); return <article key={request.id}><div><strong>{request.legal_name}</strong><small>{request.rfc} · {request.order_reference}</small><small>{dateTime.format(new Date(request.created_at))} · {order?.payment_method === "CREDIT" ? order.credit_status === "PAID" ? "Crédito pagado" : "⚠ Crédito pendiente" : "Pagado"}</small></div><b>{money.format(Number(request.amount))}</b><button onClick={() => void copyData(request)}>Copiar datos</button>{request.status === "PENDING_SAT" ? <button className={styles.done} onClick={() => { setSelected(request); setUuid(""); setFolio(""); setNotes(""); setError(""); }}>Marcar facturada</button> : <em>✓ {request.fiscal_uuid || request.sat_folio || "Facturada"}</em>}</article>; }) : <p className={styles.empty}>No hay facturas en esta sección.</p>}</div></section>
    {selected && <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className={styles.modal} role="dialog" aria-modal="true"><button className={styles.close} onClick={() => setSelected(null)}>×</button><span>FACTURA HECHA EN SAT</span><h2>{selected.order_reference}</h2><p>Pega el UUID que aparece en el CFDI para cerrar este pendiente.</p><label>UUID fiscal<input autoFocus value={uuid} onChange={(event) => setUuid(event.target.value.toUpperCase())} maxLength={36} placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" /></label><label>Folio o serie (opcional)<input value={folio} onChange={(event) => setFolio(event.target.value)} maxLength={80} placeholder="Ej. A-125" /></label><label>Nota (opcional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={300} placeholder="Observaciones" /></label>{error && <p className={styles.error}>{error}</p>}<button className={styles.confirm} disabled={saving} onClick={() => void markInvoiced()}>{saving ? "Guardando…" : "✓ Marcar como facturada"}</button></section></div>}
  </main>;
}

function sum(requests: InvoiceRequest[]) { return requests.reduce((total, request) => total + Number(request.amount || 0), 0); }
