"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./incoming-order-alert.module.css";

type OrderItem = { id?: string; name?: string; quantity?: number; unit?: string; unitPrice?: number };
type IncomingOrder = {
  id: string;
  order_reference: string;
  order_channel: string;
  payment_method: string;
  delivery_method: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_reference: string | null;
  customer_comments: string | null;
  items: OrderItem[] | null;
  amount: number;
  created_at: string;
  fulfillment_status: string;
};

const SOUND_KEY = "lonja-order-alert-sound";
const pending = (order: IncomingOrder) =>
  order.order_channel !== "POS" && ["NEW", "WAITING_COURIER"].includes(order.fulfillment_status);

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const paymentLabels: Record<string, string> = {
  CLIP: "Tarjeta / Clip",
  TRANSFER: "Transferencia",
  CASH_ON_DELIVERY: "Efectivo al recibir",
  UNSPECIFIED: "Por definir",
};

export default function IncomingOrderAlert() {
  const [orders, setOrders] = useState<IncomingOrder[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const audio = useRef<AudioContext | null>(null);

  const current = orders[0] ?? null;
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("No se pudieron consultar los pedidos.");
      const result = await response.json() as { orders?: IncomingOrder[] };
      setOrders((result.orders || []).filter(pending));
      setError("");
    } catch {
      setError("No se pudo actualizar la alarma de pedidos.");
    }
  }, []);

  useEffect(() => {
    setSoundEnabled(window.localStorage.getItem(SOUND_KEY) === "on");
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!current) return;
    const previousTitle = document.title;
    document.title = `🔔 PEDIDO NUEVO · ${current.order_reference}`;
    return () => { document.title = previousTitle; };
  }, [current]);

  useEffect(() => {
    if (!current || !soundEnabled) return;
    const context = getAudioContext(audio);
    playAlarm(context);
    const timer = window.setInterval(() => playAlarm(context), 4_000);
    return () => window.clearInterval(timer);
  }, [current, soundEnabled]);

  async function enableSound() {
    const context = getAudioContext(audio);
    await context.resume();
    setSoundEnabled(true);
    window.localStorage.setItem(SOUND_KEY, "on");
    playAlarm(context);
  }

  function disableSound() {
    setSoundEnabled(false);
    window.localStorage.setItem(SOUND_KEY, "off");
  }

  async function resolveOrder(status: "PREPARING" | "CANCELLED") {
    if (!current || saving) return;
    if (status === "CANCELLED" && !window.confirm(`¿Seguro que NO aceptarás el pedido ${current.order_reference}?`)) return;
    const acceptedOrder = current;
    const kitchenWindow = status === "PREPARING" ? window.open("", "_blank", "width=430,height=720") : null;
    if (kitchenWindow) {
      kitchenWindow.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Preparando ticket de cocina</title></head><body style="font-family:Arial;text-align:center;padding:30px"><b>Preparando ticket de cocina…</b></body></html>');
      kitchenWindow.document.close();
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillment_status: status }),
      });
      if (!response.ok) throw new Error("No se pudo guardar la decisión.");
      setOrders((previous) => previous.filter((order) => order.id !== current.id));
      if (status === "PREPARING") {
        if (kitchenWindow) printKitchenTicket(acceptedOrder, kitchenWindow);
        else setError("Pedido aceptado. El navegador bloqueó el ticket; permite ventanas emergentes para imprimirlo automáticamente.");
      }
      void refresh();
    } catch (cause) {
      kitchenWindow?.close();
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar el pedido.");
    } finally {
      setSaving(false);
    }
  }

  const itemCount = useMemo(() => (current?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0), [current]);

  return (
    <>
      <button className={`${styles.soundControl} ${soundEnabled ? styles.soundOn : ""}`} type="button" onClick={() => soundEnabled ? disableSound() : void enableSound()}>
        {soundEnabled ? "🔊 Alarma activa" : "🔇 Activar alarma"}
      </button>

      {current && <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="incoming-order-title">
        <section className={styles.modal}>
          <div className={styles.alarmBar}><span>🔔</span> PEDIDO NUEVO <span>🔔</span></div>
          <div className={styles.heading}>
            <div>
              <p>Pedido {current.order_reference}</p>
              <h2 id="incoming-order-title">{current.customer_name || "Cliente"}</h2>
              <span>{new Date(current.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</span>
            </div>
            <strong>{money.format(Number(current.amount || 0))}</strong>
          </div>

          <div className={styles.summary}>
            <span>📦 {itemCount} {itemCount === 1 ? "producto" : "productos"}</span>
            <span>{current.delivery_method === "PICKUP" ? "🏪 Recoge en tienda" : "🛵 Entrega a domicilio"}</span>
            <span>💳 {paymentLabels[current.payment_method] || current.payment_method}</span>
          </div>

          <div className={styles.details}>
            <div className={styles.items}>
              <h3>Productos</h3>
              {(current.items || []).map((item, index) => <div className={styles.item} key={item.id || `${item.name}-${index}`}>
                <span><b>{item.quantity ?? 0}</b> {item.unit || "pza"} · {item.name || "Producto"}</span>
                <strong>{money.format(Number(item.quantity || 0) * Number(item.unitPrice || 0))}</strong>
              </div>)}
            </div>
            <div className={styles.customer}>
              <h3>Datos del cliente</h3>
              <p><b>Teléfono:</b> {current.customer_phone || "No indicado"}</p>
              <p><b>Dirección:</b> {current.delivery_method === "PICKUP" ? "Recoge en tienda" : current.delivery_address || "No indicada"}</p>
              {current.delivery_reference && <p><b>Referencia:</b> {current.delivery_reference}</p>}
              {current.customer_comments && <p className={styles.comments}><b>Comentarios:</b> {current.customer_comments}</p>}
            </div>
          </div>

          {!soundEnabled && <button className={styles.enableSound} type="button" onClick={() => void enableSound()}>🔊 Activar sonido de alarma</button>}
          {error && <p className={styles.error} role="alert">{error}</p>}
          {orders.length > 1 && <p className={styles.queue}>Hay {orders.length - 1} {orders.length === 2 ? "pedido más" : "pedidos más"} esperando.</p>}

          <div className={styles.actions}>
            <button className={styles.reject} disabled={saving} type="button" onClick={() => void resolveOrder("CANCELLED")}>✕ NO ACEPTAR</button>
            <button className={styles.accept} disabled={saving} type="button" onClick={() => void resolveOrder("PREPARING")}>{saving ? "GUARDANDO…" : "✓ ACEPTAR Y PREPARAR"}</button>
          </div>
        </section>
      </div>}
    </>
  );
}

function getAudioContext(reference: { current: AudioContext | null }) {
  if (!reference.current) reference.current = new AudioContext();
  return reference.current;
}

function playAlarm(context: AudioContext) {
  void context.resume();
  const now = context.currentTime;
  [740, 920, 1120, 920].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + index * .23;
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(.32, start + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .2);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + .22);
  });
}

function printKitchenTicket(order: IncomingOrder, popup: Window) {
  const rows = (order.items || []).map((item) => `<tr><td class="qty">${escapeHtml(formatQuantity(item.quantity))}</td><td><b>${escapeHtml(item.name || "Producto")}</b>${item.unit ? `<br><small>${escapeHtml(item.unit)}</small>` : ""}</td></tr>`).join("");
  const delivery = order.delivery_method === "PICKUP" ? "RECOGE EN TIENDA" : "ENTREGA A DOMICILIO";
  popup.document.open();
  popup.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cocina ${escapeHtml(order.order_reference)}</title><style>@page{size:80mm auto;margin:3mm}*{box-sizing:border-box}html,body{width:74mm;margin:0;padding:0}body{color:#000;background:#fff;font:14px/1.3 Arial,sans-serif}h1{margin:0;text-align:center;font-size:24px}h2{text-align:center;margin:7px 0;font-size:20px}.big{text-align:center;border:2px solid #000;padding:7px;margin:8px 0;font-size:18px;font-weight:900}.meta{margin:7px 0}.divider{border-top:2px dashed #000;margin:10px 0}table{width:100%;border-collapse:collapse}.qty{width:24%;font-size:22px;font-weight:900;vertical-align:top;padding:9px 5px 9px 0}td{border-bottom:1px solid #000;padding:9px 0;font-size:16px}.notes{border:3px solid #000;padding:9px;margin-top:12px;font-size:16px}.notes b{display:block;font-size:18px;margin-bottom:4px}.footer{text-align:center;margin-top:12px;font-weight:900}@media print{html,body{width:74mm}}</style></head><body><h1>LA LONJA · COCINA</h1><h2>${escapeHtml(order.order_reference)}</h2><div class="big">${delivery}</div><div class="meta"><b>Cliente:</b> ${escapeHtml(order.customer_name || "Cliente")}<br><b>Hora:</b> ${escapeHtml(new Date(order.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }))}${order.delivery_method === "DELIVERY" ? `<br><b>Dirección:</b> ${escapeHtml(order.delivery_address || "No indicada")}` : ""}</div><div class="divider"></div><table>${rows}</table>${order.customer_comments ? `<div class="notes"><b>⚠ INDICACIONES</b>${escapeHtml(order.customer_comments)}</div>` : ""}<p class="footer">PEDIDO EN PREPARACIÓN</p><script>addEventListener("load",()=>{focus();print()})<\/script></body></html>`);
  popup.document.close();
}

function formatQuantity(value?: number) {
  const quantity = Number(value || 0);
  return Number.isInteger(quantity) ? String(quantity) : quantity.toLocaleString("es-MX", { maximumFractionDigits: 3 });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}
