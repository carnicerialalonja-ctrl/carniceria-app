"use client";

import { useState } from "react";
import type { CashRegisterData } from "@/lib/cash-register";
import styles from "./caja.module.css";

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const dateTime = new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", dateStyle: "short", timeStyle: "short" });

export default function CashRegister({ initialData }: { initialData: CashRegisterData }) {
  const [mode, setMode] = useState<"NONE" | "IN" | "OUT" | "CLOSE">("NONE");
  const [openingAmount, setOpeningAmount] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [countedAmount, setCountedAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const session = initialData.openSession;
  const counted = Number(countedAmount);
  const previewDifference = Number.isFinite(counted) ? counted - initialData.expectedCash : 0;

  async function submit(payload: Record<string, unknown>) {
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/admin/pos/cash", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "No fue posible guardar.");
      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No fue posible guardar.");
      setSaving(false);
    }
  }

  return <main className={styles.shell}>
    <header className={styles.header}>
      <div><span>CONTROL DE EFECTIVO</span><h1>Caja</h1><p>{session ? `Abierta desde ${dateTime.format(new Date(session.opened_at))}` : "Inicia el turno antes de cobrar."}</p></div>
      <nav><a href="/admin/pos">← Regresar al POS</a><a href="/admin/pos/corte">Corte del día</a></nav>
    </header>

    {!session ? <section className={styles.openCard}>
      <span>APERTURA DE TURNO</span><h2>¿Con cuánto efectivo inicia la caja?</h2>
      <label>Fondo inicial<div className={styles.moneyInput}><b>$</b><input autoFocus type="number" min="0" step="0.01" inputMode="decimal" value={openingAmount} onChange={(event) => setOpeningAmount(event.target.value)} placeholder="0.00" /></div></label>
      <label>Nota opcional<input value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={300} placeholder="Ej. Turno de mañana" /></label>
      {error && <p className={styles.error}>{error}</p>}
      <button disabled={saving} onClick={() => void submit({ action: "OPEN", amount: openingAmount, notes })}>{saving ? "Abriendo…" : "Abrir caja y comenzar"}</button>
    </section> : <>
      <section className={styles.summary}>
        <article className={styles.expected}><span>EFECTIVO ESPERADO</span><strong>{money.format(initialData.expectedCash)}</strong><small>Lo que debe haber físicamente</small></article>
        <article><span>FONDO INICIAL</span><strong>{money.format(Number(session.opening_amount))}</strong><small>Al abrir la caja</small></article>
        <article><span>VENTAS EN EFECTIVO</span><strong>{money.format(initialData.cashSales)}</strong><small>{initialData.cashOperations} operaciones</small></article>
        <article><span>VENTAS CON TARJETA</span><strong>{money.format(initialData.cardSales)}</strong><small>{initialData.cardOperations} operaciones</small></article>
        <article><span>ENTRADAS</span><strong className={styles.positive}>+{money.format(initialData.moneyIn)}</strong><small>Fuera de ventas</small></article>
        <article><span>SALIDAS</span><strong className={styles.negative}>−{money.format(initialData.moneyOut)}</strong><small>Gastos o retiros</small></article>
      </section>

      <section className={styles.quickActions}>
        <button className={styles.inButton} onClick={() => setMode("IN")}>＋ Entrada de efectivo</button>
        <button className={styles.outButton} onClick={() => setMode("OUT")}>− Salida o gasto</button>
        <button className={styles.closeButton} onClick={() => setMode("CLOSE")}>Cerrar caja</button>
      </section>

      <section className={styles.movements}>
        <div><span>MOVIMIENTOS DEL TURNO</span><h2>Entradas y salidas</h2></div>
        {initialData.movements.length ? initialData.movements.map((movement) => <article key={movement.id}>
          <b className={movement.movement_type === "IN" ? styles.positive : styles.negative}>{movement.movement_type === "IN" ? "+" : "−"}{money.format(Number(movement.amount))}</b>
          <div><strong>{movement.reason}</strong><small>{dateTime.format(new Date(movement.created_at))}</small></div>
        </article>) : <p>No hay movimientos adicionales en este turno.</p>}
      </section>
    </>}

    <section className={styles.history}>
      <div><span>HISTORIAL</span><h2>Cierres anteriores</h2></div>
      {initialData.sessions.filter((item) => item.status === "CLOSED").slice(0, 10).map((item) => <article key={item.id}>
        <div><strong>{dateTime.format(new Date(item.opened_at))}</strong><small>Cerró {item.closed_at ? dateTime.format(new Date(item.closed_at)) : "—"}</small></div>
        <span>Esperado <b>{money.format(Number(item.expected_amount))}</b></span>
        <span>Contado <b>{money.format(Number(item.counted_amount))}</b></span>
        <span className={Number(item.difference) === 0 ? "" : Number(item.difference) > 0 ? styles.positive : styles.negative}>Diferencia <b>{money.format(Number(item.difference))}</b></span>
      </article>)}
    </section>

    {mode !== "NONE" && <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setMode("NONE"); }}>
      <section className={styles.modal} role="dialog" aria-modal="true">
        <button className={styles.x} onClick={() => setMode("NONE")}>×</button>
        {mode === "CLOSE" ? <>
          <span>CIERRE DE TURNO</span><h2>Cuenta el efectivo físico</h2><p>El sistema espera <b>{money.format(initialData.expectedCash)}</b>.</p>
          <label>Efectivo contado<div className={styles.moneyInput}><b>$</b><input autoFocus type="number" min="0" step="0.01" inputMode="decimal" value={countedAmount} onChange={(event) => setCountedAmount(event.target.value)} placeholder="0.00" /></div></label>
          {countedAmount && <div className={`${styles.difference} ${previewDifference === 0 ? styles.exact : previewDifference > 0 ? styles.positiveBox : styles.negativeBox}`}><span>{previewDifference === 0 ? "Caja exacta" : previewDifference > 0 ? "Sobrante" : "Faltante"}</span><strong>{money.format(Math.abs(previewDifference))}</strong></div>}
          <label>Nota opcional<input value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={300} placeholder="Observaciones del cierre" /></label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.confirmClose} disabled={saving} onClick={() => { if (window.confirm("¿Confirmas que deseas cerrar la caja?")) void submit({ action: "CLOSE", countedAmount, notes }); }}>{saving ? "Cerrando…" : "Confirmar cierre"}</button>
        </> : <>
          <span>{mode === "IN" ? "ENTRADA DE EFECTIVO" : "SALIDA DE EFECTIVO"}</span><h2>{mode === "IN" ? "Agregar dinero a caja" : "Registrar gasto o retiro"}</h2>
          <label>Importe<div className={styles.moneyInput}><b>$</b><input autoFocus type="number" min="0.01" step="0.01" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></div></label>
          <label>Motivo<input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={160} placeholder={mode === "IN" ? "Ej. Cambio adicional" : "Ej. Compra de bolsas"} /></label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={mode === "IN" ? styles.confirmIn : styles.confirmOut} disabled={saving} onClick={() => void submit({ action: "MOVEMENT", movementType: mode, amount, reason })}>{saving ? "Guardando…" : "Guardar movimiento"}</button>
        </>}
      </section>
    </div>}
  </main>;
}
