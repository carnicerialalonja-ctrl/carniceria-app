"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type OrderItem = { id: string; name: string; quantity: number; unit: string; unitPrice: number };
export type Order = {
  id: string;
  order_reference: string;
  order_channel: "CLIP" | "WHATSAPP" | "POS";
  payment_method: "CLIP" | "TRANSFER" | "CASH_ON_DELIVERY" | "UNSPECIFIED";
  delivery_method: "DELIVERY" | "PICKUP";
  clip_status: string;
  receipt_no: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_reference: string | null;
  customer_comments: string | null;
  items: OrderItem[];
  amount: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
  fulfillment_status: FulfillmentStatus;
  internal_notes: string | null;
  fulfillment_updated_at: string;
};

type FulfillmentStatus = "NEW" | "WAITING_COURIER" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
type AnalyticsPeriod = "TODAY" | "WEEK" | "MONTH";

const fulfillment: Record<FulfillmentStatus, { label: string; color: string }> = {
  NEW: { label: "Nuevo", color: "#2563eb" },
  WAITING_COURIER: { label: "Esperando repartidor", color: "#c2410c" },
  CONFIRMED: { label: "Confirmado", color: "#7c3aed" },
  PREPARING: { label: "Preparando", color: "#d97706" },
  READY: { label: "Listo", color: "#0891b2" },
  OUT_FOR_DELIVERY: { label: "En camino", color: "#ea580c" },
  DELIVERED: { label: "Entregado", color: "#16a34a" },
  CANCELLED: { label: "Cancelado", color: "#dc2626" },
};

const paymentLabels: Record<string, { label: string; color: string }> = {
  CREATING_PAYMENT: { label: "Creando pago", color: "#f59e0b" },
  CHECKOUT_CREATED: { label: "Pendiente de pago", color: "#f59e0b" },
  CHECKOUT_PENDING: { label: "Pago pendiente", color: "#f59e0b" },
  CHECKOUT_COMPLETED: { label: "Pagado", color: "#16a34a" },
  CHECKOUT_CANCELLED: { label: "Pago cancelado", color: "#dc2626" },
  CHECKOUT_EXPIRED: { label: "Pago expirado", color: "#71717a" },
  ERROR: { label: "Error de pago", color: "#dc2626" },
};

const paymentMethodLabels: Record<string, string> = {
  CLIP: "Tarjeta / Clip", TRANSFER: "Transferencia", CASH_ON_DELIVERY: "Efectivo al recibir", UNSPECIFIED: "Pago no especificado",
};
const deliveryMethodLabels: Record<string, string> = { DELIVERY: "Entrega a domicilio", PICKUP: "Recoger en tienda" };
const needsConfirmation = (order: Order) => ["NEW", "WAITING_COURIER"].includes(order.fulfillment_status);

export default function OrdersDashboard({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pendingAlertIds, setPendingAlertIds] = useState<string[]>(() => initialOrders.filter(needsConfirmation).map((order) => order.id));
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionMessage, setConnectionMessage] = useState("Actualización automática activa");
  const [analyticsOrders, setAnalyticsOrders] = useState<Order[]>(initialOrders);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>("TODAY");
  const [analyticsUpdated, setAnalyticsUpdated] = useState<Date | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const pendingAlertOrders = useMemo(
    () => pendingAlertIds.map((id) => orders.find((order) => order.id === id)).filter((order): order is Order => Boolean(order)),
    [orders, pendingAlertIds]
  );

  useEffect(() => {
    let active = true;

    const refreshOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders", { cache: "no-store" });
        if (response.status === 401) {
          window.location.assign("/admin/login");
          return;
        }
        const result = await response.json() as { orders?: Order[]; error?: string };
        if (!response.ok || !result.orders) throw new Error(result.error || "No se pudieron actualizar los pedidos.");
        if (!active) return;

        setOrders(result.orders);
        setPendingAlertIds(result.orders.filter(needsConfirmation).map((order) => order.id));
        setLastUpdated(new Date());
        setConnectionMessage("Actualización automática activa");
      } catch {
        if (active) setConnectionMessage("Sin conexión; volveremos a intentar automáticamente");
      }
    };

    const timer = window.setInterval(refreshOrders, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (pendingAlertIds.length === 0) {
      document.title = "Control de pedidos | La Lonja";
      return;
    }
    document.title = `🔔 ${pendingAlertIds.length} pedido${pendingAlertIds.length === 1 ? "" : "s"} por confirmar`;
    return () => { document.title = "Control de pedidos | La Lonja"; };
  }, [pendingAlertIds.length]);

  useEffect(() => {
    if (!soundEnabled || pendingAlertIds.length === 0 || !audioContext.current) return;
    playOrderAlert(audioContext.current);
    const timer = window.setInterval(() => {
      if (audioContext.current) playOrderAlert(audioContext.current);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [soundEnabled, pendingAlertIds.length]);

  useEffect(() => {
    let active = true;

    const refreshAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics", { cache: "no-store" });
        if (response.status === 401) {
          window.location.assign("/admin/login");
          return;
        }
        const result = await response.json() as { orders?: Order[] };
        if (!response.ok || !result.orders) throw new Error("No fue posible actualizar las estadísticas.");
        if (active) {
          setAnalyticsOrders(result.orders);
          setAnalyticsUpdated(new Date());
        }
      } catch {
        // Conserva las últimas cifras disponibles y vuelve a intentar después.
      }
    };

    void refreshAnalytics();
    const timer = window.setInterval(refreshAnalytics, 60000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const filtered = useMemo(() => {
    const term = normalize(search);
    return orders.filter((order) => {
      const haystack = normalize(`${order.order_reference} ${order.customer_name} ${order.customer_phone} ${order.delivery_address}`);
      const matchesSearch = !term || haystack.includes(term);
      const matchesStatus = statusFilter === "ALL" || order.fulfillment_status === statusFilter;
      const paid = order.clip_status === "CHECKOUT_COMPLETED";
      const matchesPayment = paymentFilter === "ALL" || (paymentFilter === "PAID" ? paid : !paid);
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const paidOrders = orders.filter((order) => order.clip_status === "CHECKOUT_COMPLETED");
  const pendingOrders = orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.fulfillment_status));
  const analytics = useMemo(
    () => calculateAnalytics(analyticsOrders, analyticsPeriod),
    [analyticsOrders, analyticsPeriod]
  );

  async function updateOrder(id: string, patch: { fulfillment_status?: FulfillmentStatus; internal_notes?: string }) {
    setSaving(id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No fue posible guardar el cambio.");
      setOrders((current) => current.map((order) => order.id === id ? { ...order, ...result.order } : order));
      if (patch.fulfillment_status) {
        const nextStatus = patch.fulfillment_status;
        setPendingAlertIds((current) => ["NEW", "WAITING_COURIER"].includes(nextStatus)
          ? [...new Set([...current, id])]
          : current.filter((orderId) => orderId !== id));
      }
      setMessage("Cambio guardado correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible guardar el cambio.");
    } finally {
      setSaving(null);
    }
  }

  async function copyText(text: string, success: string) {
    await navigator.clipboard.writeText(text);
    setMessage(success);
  }

  async function toggleSound() {
    if (soundEnabled) {
      setSoundEnabled(false);
      await audioContext.current?.close().catch(() => undefined);
      audioContext.current = null;
      return;
    }

    const context = new AudioContext();
    audioContext.current = context;
    setSoundEnabled(true);
    if (pendingAlertIds.length === 0) playOrderAlert(context);
    setMessage("Sonido de pedidos nuevos activado.");
  }

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>CARNICERÍA LA LONJA</p>
          <h1 style={styles.title}>Control de pedidos</h1>
          <p style={styles.subtitle}>Atención, preparación y entrega desde un solo lugar.</p>
        </div>
        <div style={styles.headerActions}>
          <button type="button" onClick={toggleSound} style={{ ...styles.soundButton, ...(soundEnabled ? styles.soundButtonActive : {}) }}>
            {soundEnabled ? "🔊 Sonido activo" : "🔔 Activar sonido"}
          </button>
          <a href="/admin/pos" style={styles.homeLink}>← Regresar al POS</a>
          <a href="/" style={styles.homeLink}>Ver tienda</a>
          <form action="/admin/logout" method="post"><button type="submit" style={styles.logout}>Cerrar sesión</button></form>
        </div>
      </header>

      <section style={styles.liveStatus}>
        <span><b>●</b> {connectionMessage}</span>
        <span>{lastUpdated ? `Última revisión: ${lastUpdated.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Revisando cada 15 segundos"}</span>
      </section>

      <section style={styles.analyticsSection}>
        <div style={styles.analyticsHeader}>
          <div>
            <p style={styles.analyticsEyebrow}>ESTADÍSTICAS DE VENTAS</p>
            <h2 style={styles.analyticsTitle}>Resumen {periodLabel(analyticsPeriod).toLowerCase()}</h2>
          </div>
          <div style={styles.periodButtons}>
            {(["TODAY", "WEEK", "MONTH"] as AnalyticsPeriod[]).map((period) => (
              <button key={period} type="button" onClick={() => setAnalyticsPeriod(period)} style={{ ...styles.periodButton, ...(analyticsPeriod === period ? styles.periodButtonActive : {}) }}>
                {periodLabel(period)}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.analyticsCards}>
          <MetricCard value={`$${money(analytics.sales)}`} label="Ventas cobradas" detail="Pagos confirmados" />
          <MetricCard value={analytics.totalOrders} label="Pedidos creados" detail={`${analytics.paidCount} pagados`} />
          <MetricCard value={`$${money(analytics.averageTicket)}`} label="Ticket promedio" detail="Entre pedidos pagados" />
          <MetricCard value={analytics.productsSold} label="Productos vendidos" detail="Productos distintos pagados" />
        </div>

        <div style={styles.analyticsGrid}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Estado de los pedidos</h3>
            <StatusBar label="Pagados" value={analytics.paidCount} total={analytics.totalOrders} color="#16a34a" />
            <StatusBar label="Pendientes" value={analytics.pendingCount} total={analytics.totalOrders} color="#f59e0b" />
            <StatusBar label="Cancelados" value={analytics.cancelledCount} total={analytics.totalOrders} color="#dc2626" />
          </div>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Productos más vendidos</h3>
            {analytics.topProducts.length === 0 ? <p style={styles.noData}>Todavía no hay productos pagados en este periodo.</p> : analytics.topProducts.map((product, index) => (
              <div key={product.key} style={styles.productMetric}>
                <div style={styles.productMetricTop}><span>{index + 1}. {product.name}</span><strong>${money(product.revenue)}</strong></div>
                <div style={styles.productBarTrack}><span style={{ ...styles.productBarFill, width: `${Math.max(5, (product.revenue / analytics.maxProductRevenue) * 100)}%` }} /></div>
                <small style={styles.productMetricDetail}>{product.quantity.toLocaleString("es-MX", { maximumFractionDigits: 1 })} {product.unit}</small>
              </div>
            ))}
          </div>
        </div>
        <p style={styles.analyticsFootnote}>Periodo según la fecha de creación del pedido. Ventas y productos incluyen únicamente pagos confirmados por Clip. {analyticsUpdated ? `Actualizado ${analyticsUpdated.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}.` : "Actualizando…"}</p>
      </section>

      <h2 style={styles.ordersHeading}>Operación de pedidos</h2>

      <section style={styles.summary}>
        <Summary value={orders.length} label="Pedidos registrados" />
        <Summary value={pendingOrders.length} label="Por atender" />
        <Summary value={paidOrders.length} label="Pagados" />
        <Summary value={`$${money(paidOrders.reduce((sum, order) => sum + Number(order.amount), 0))}`} label="Total pagado" />
      </section>

      <section style={styles.filters}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente, teléfono, dirección o pedido…" style={styles.search} />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={styles.select} aria-label="Filtrar por estado">
          <option value="ALL">Todos los estados</option>
          {Object.entries(fulfillment).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
        </select>
        <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} style={styles.select} aria-label="Filtrar por pago">
          <option value="ALL">Todos los pagos</option><option value="PAID">Pagados</option><option value="PENDING">No pagados</option>
        </select>
      </section>

      {pendingAlertOrders.length > 0 && (
        <div role="alert" style={styles.newOrderAlert}>
          <span style={styles.alertBell}>🔔</span>
          <div style={styles.alertInfo}>
            <strong>{pendingAlertOrders.length === 1 ? `Pedido nuevo de ${pendingAlertOrders[0].customer_name}` : `${pendingAlertOrders.length} pedidos nuevos por confirmar`}</strong>
            <span>{pendingAlertOrders[0].order_reference} · ${money(Number(pendingAlertOrders[0].amount))} · {channelLabel(pendingAlertOrders[0].order_channel).label}</span>
          </div>
          <div style={styles.alertActions}>
            <button type="button" disabled={saving === pendingAlertOrders[0].id} onClick={() => updateOrder(pendingAlertOrders[0].id, { fulfillment_status: "CONFIRMED" })} style={styles.confirmAlertButton}>✓ Confirmar</button>
            <button type="button" disabled={saving === pendingAlertOrders[0].id} onClick={() => { if (window.confirm(`¿Rechazar el pedido ${pendingAlertOrders[0].order_reference}?`)) void updateOrder(pendingAlertOrders[0].id, { fulfillment_status: "CANCELLED" }); }} style={styles.rejectAlertButton}>✕ Rechazar</button>
          </div>
        </div>
      )}
      {message && <div style={styles.toast}>{message}</div>}
      <p style={styles.results}>{filtered.length} pedido{filtered.length === 1 ? "" : "s"} mostrado{filtered.length === 1 ? "" : "s"}</p>

      {filtered.length === 0 ? <section style={styles.empty}>No hay pedidos que coincidan con los filtros.</section> : (
        <section style={styles.grid}>
          {filtered.map((order) => <OrderCard key={order.id} order={order} saving={saving === order.id} updateOrder={updateOrder} copyText={copyText} />)}
        </section>
      )}
    </main>
  );
}

function Summary({ value, label }: { value: string | number; label: string }) {
  return <div style={styles.summaryCard}><strong style={styles.summaryNumber}>{value}</strong><span>{label}</span></div>;
}

function MetricCard({ value, label, detail }: { value: string | number; label: string; detail: string }) {
  return <div style={styles.metricCard}><strong style={styles.metricValue}>{value}</strong><span style={styles.metricLabel}>{label}</span><small style={styles.metricDetail}>{detail}</small></div>;
}

function StatusBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return <div style={styles.statusMetric}><div style={styles.statusMetricTop}><span>{label}</span><strong>{value} · {percentage}%</strong></div><div style={styles.statusBarTrack}><span style={{ ...styles.statusBarFill, width: `${percentage}%`, background: color }} /></div></div>;
}

function OrderCard({ order, saving, updateOrder, copyText }: {
  order: Order;
  saving: boolean;
  updateOrder: (id: string, patch: { fulfillment_status?: FulfillmentStatus; internal_notes?: string }) => Promise<void>;
  copyText: (text: string, success: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(order.internal_notes || "");
  const status = fulfillment[order.fulfillment_status] || fulfillment.NEW;
  const payment = paymentLabels[order.clip_status] || { label: order.clip_status, color: "#71717a" };
  const paymentMethod = paymentMethodLabels[order.payment_method] || order.payment_method;
  const deliveryMethod = deliveryMethodLabels[order.delivery_method] || order.delivery_method;
  const channel = channelLabel(order.order_channel);
  const phone = order.customer_phone.replace(/\D/g, "");
  const summary = `${order.order_reference}\nCliente: ${order.customer_name}\nTel: ${order.customer_phone}\nEntrega: ${deliveryMethod}\nPago: ${paymentMethod}\nDirección: ${order.delivery_address}\n${order.delivery_reference ? `Referencia: ${order.delivery_reference}\n` : ""}Productos:\n${(order.items || []).map((item) => `- ${item.quantity} ${item.unit} ${item.name}`).join("\n")}\nTotal: $${money(Number(order.amount))} ${order.currency}`;
  const whatsapp = `https://wa.me/${phone}?text=${encodeURIComponent(`Hola ${order.customer_name}, te contactamos de Carnicería La Lonja sobre tu pedido ${order.order_reference}.`)}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`;

  return <article style={styles.card}>
    <div style={styles.cardTop}>
      <div><strong style={styles.reference}>{order.order_reference}</strong><span style={styles.date}>{formatDate(order.created_at)}</span></div>
      <div style={styles.badges}><span style={{ ...styles.badge, background: channel.color }}>{channel.label}</span><span style={{ ...styles.badge, background: status.color }}>{status.label}</span><span style={{ ...styles.badge, background: payment.color }}>{payment.label}</span><span style={{ ...styles.badge, background: "#0369a1" }}>{paymentMethod}</span><span style={{ ...styles.badge, background: "#52525b" }}>{deliveryMethod}</span></div>
    </div>

    <label style={styles.fieldLabel}>Estado del pedido</label>
    <select value={order.fulfillment_status} disabled={saving} onChange={(event) => updateOrder(order.id, { fulfillment_status: event.target.value as FulfillmentStatus })} style={styles.statusSelect}>
      {Object.entries(fulfillment).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
    </select>

    <div style={styles.customer}>
      <h2 style={styles.customerName}>{order.customer_name}</h2>
      <a href={`tel:${phone}`} style={styles.phone}>{order.customer_phone}</a>
      <p style={styles.address}>{order.delivery_address}</p>
      {order.delivery_reference && <p style={styles.detail}><b>Referencia:</b> {order.delivery_reference}</p>}
      {order.customer_comments && <p style={styles.detail}><b>Comentarios:</b> {order.customer_comments}</p>}
    </div>

    <div style={styles.quickActions}>
      <a href={whatsapp} target="_blank" rel="noreferrer" style={{ ...styles.action, background: "#16a34a" }}>WhatsApp</a>
      <a href={`tel:${phone}`} style={styles.action}>Llamar</a>
      <a href={maps} target="_blank" rel="noreferrer" style={styles.action}>Abrir Maps</a>
      <button type="button" onClick={() => copyText(order.delivery_address, "Dirección copiada.")} style={styles.action}>Copiar dirección</button>
      <button type="button" onClick={() => copyText(summary, "Resumen copiado.")} style={styles.action}>Copiar pedido</button>
      <button type="button" onClick={() => printOrder(order)} style={{ ...styles.action, background: "#facc15", color: "#18181b", borderColor: "#facc15" }}>🖨️ Imprimir nota</button>
    </div>

    <div style={styles.items}>{(order.items || []).map((item, index) => <div key={`${item.id}-${index}`} style={styles.itemRow}><span>{item.quantity} {item.unit} · {item.name}</span><strong>${money(item.quantity * item.unitPrice)}</strong></div>)}</div>
    <div style={styles.totalRow}><span>Total</span><strong>${money(Number(order.amount))} {order.currency}</strong></div>
    {order.receipt_no && <p style={styles.receipt}>Recibo Clip: {order.receipt_no}</p>}

    <label style={styles.fieldLabel}>Notas internas</label>
    <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ej. Cliente pidió llamar al llegar…" maxLength={1000} style={styles.notes} />
    <button type="button" disabled={saving || notes === (order.internal_notes || "")} onClick={() => updateOrder(order.id, { internal_notes: notes })} style={{ ...styles.save, opacity: saving || notes === (order.internal_notes || "") ? .55 : 1 }}>{saving ? "Guardando…" : "Guardar notas"}</button>
    <p style={styles.updated}>Estado actualizado: {formatDate(order.fulfillment_updated_at)}</p>
  </article>;
}

function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function channelLabel(channel: Order["order_channel"]) {
  if (channel === "WHATSAPP") return { label: "WhatsApp", color: "#16a34a" };
  if (channel === "POS") return { label: "Punto de venta", color: "#ca8a04" };
  return { label: "Clip", color: "#ff5a1f" };
}
function money(value: number) { return value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Mexico_City" }).format(new Date(value)); }

function printOrder(order: Order) {
  const printWindow = window.open("", "_blank", "width=520,height=760");
  if (!printWindow) {
    window.alert("El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio e inténtalo nuevamente.");
    return;
  }

  const status = fulfillment[order.fulfillment_status]?.label || order.fulfillment_status;
  const payment = paymentLabels[order.clip_status]?.label || order.clip_status;
  const paymentMethod = paymentMethodLabels[order.payment_method] || order.payment_method;
  const deliveryMethod = deliveryMethodLabels[order.delivery_method] || order.delivery_method;
  const channel = channelLabel(order.order_channel).label;
  const itemRows = (order.items || []).map((item) => `
    <tr>
      <td>${escapeHtml(`${item.quantity} ${item.unit}`)}</td>
      <td>${escapeHtml(item.name)}</td>
      <td class="number">$${money(item.quantity * item.unitPrice)}</td>
    </tr>`).join("");

  printWindow.document.write(`<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(order.order_reference)} | La Lonja</title>
      <style>
        @page { margin: 8mm; }
        * { box-sizing: border-box; }
        body { margin: 0 auto; max-width: 760px; color: #111; background: white; font: 14px/1.35 Arial, sans-serif; }
        header { padding-bottom: 12px; border-bottom: 3px solid #111; text-align: center; }
        h1 { margin: 0; font-size: 26px; text-transform: uppercase; }
        .subtitle { margin: 3px 0 0; font-weight: 700; }
        .reference { margin: 12px 0 3px; font-size: 21px; font-weight: 900; }
        .date { margin: 0; color: #444; }
        .badges { display: flex; justify-content: center; gap: 8px; margin-top: 9px; }
        .badge { padding: 4px 8px; border: 1px solid #111; border-radius: 999px; font-size: 12px; font-weight: 800; }
        section { padding: 12px 0; border-bottom: 1px dashed #555; }
        h2 { margin: 0 0 7px; font-size: 14px; text-transform: uppercase; }
        p { margin: 4px 0; overflow-wrap: anywhere; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 7px 3px; border-bottom: 1px solid #ddd; text-align: left; vertical-align: top; }
        th { font-size: 11px; text-transform: uppercase; }
        .number { text-align: right; white-space: nowrap; }
        .total { display: flex; justify-content: space-between; margin-top: 10px; font-size: 20px; font-weight: 900; }
        .checks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding-top: 15px; }
        .check { min-height: 42px; padding: 10px; border: 1px solid #777; }
        footer { padding-top: 14px; text-align: center; color: #444; font-size: 11px; }
        @media print { body { max-width: none; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <header>
        <h1>Carnicería La Lonja</h1>
        <p class="subtitle">Nota de preparación y entrega</p>
        <p class="reference">${escapeHtml(order.order_reference)}</p>
        <p class="date">${escapeHtml(formatDate(order.created_at))}</p>
        <div class="badges"><span class="badge">${escapeHtml(channel)}</span><span class="badge">${escapeHtml(status)}</span><span class="badge">${escapeHtml(paymentMethod)}</span><span class="badge">${escapeHtml(deliveryMethod)}</span><span class="badge">${escapeHtml(payment)}</span></div>
      </header>
      <section>
        <h2>Cliente</h2>
        <p><b>Nombre:</b> ${escapeHtml(order.customer_name)}</p>
        <p><b>Teléfono:</b> ${escapeHtml(order.customer_phone)}</p>
        <p><b>Domicilio:</b> ${escapeHtml(order.delivery_address)}</p>
        ${order.delivery_reference ? `<p><b>Referencia:</b> ${escapeHtml(order.delivery_reference)}</p>` : ""}
        ${order.customer_comments ? `<p><b>Comentarios:</b> ${escapeHtml(order.customer_comments)}</p>` : ""}
      </section>
      <section>
        <h2>Productos</h2>
        <table><thead><tr><th>Cantidad</th><th>Producto</th><th class="number">Importe</th></tr></thead><tbody>${itemRows}</tbody></table>
        <div class="total"><span>Total</span><span>$${money(Number(order.amount))} ${escapeHtml(order.currency)}</span></div>
        ${order.receipt_no ? `<p><b>Recibo Clip:</b> ${escapeHtml(order.receipt_no)}</p>` : ""}
      </section>
      ${order.internal_notes ? `<section><h2>Notas internas</h2><p>${escapeHtml(order.internal_notes)}</p></section>` : ""}
      <div class="checks"><div class="check">☐ Pedido revisado</div><div class="check">☐ Pedido entregado</div></div>
      <footer>Mercado Morelos · Local interior 96 · Impreso ${escapeHtml(new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" }))}</footer>
      <script>window.addEventListener("load", () => { window.focus(); window.print(); });<\/script>
    </body>
  </html>`);
  printWindow.document.close();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;",
  })[character] || character);
}

function calculateAnalytics(orders: Order[], period: AnalyticsPeriod) {
  const selected = orders.filter((order) => isInPeriod(order.created_at, period));
  const paid = selected.filter((order) => order.clip_status === "CHECKOUT_COMPLETED");
  const cancelled = selected.filter((order) => order.clip_status === "CHECKOUT_CANCELLED" || order.clip_status === "CHECKOUT_EXPIRED" || order.fulfillment_status === "CANCELLED");
  const cancelledIds = new Set(cancelled.map((order) => order.id));
  const pending = selected.filter((order) => order.clip_status !== "CHECKOUT_COMPLETED" && !cancelledIds.has(order.id));
  const sales = paid.reduce((sum, order) => sum + Number(order.amount), 0);
  const products = new Map<string, { key: string; name: string; unit: string; quantity: number; revenue: number }>();

  paid.forEach((order) => (order.items || []).forEach((item) => {
    const key = `${item.id}|${item.unit}`;
    const current = products.get(key) || { key, name: item.name, unit: item.unit, quantity: 0, revenue: 0 };
    current.quantity += Number(item.quantity) || 0;
    current.revenue += (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    products.set(key, current);
  }));

  const allProducts = [...products.values()];
  const topProducts = allProducts.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  return {
    totalOrders: selected.length,
    paidCount: paid.length,
    pendingCount: pending.length,
    cancelledCount: cancelled.length,
    sales,
    averageTicket: paid.length ? sales / paid.length : 0,
    productsSold: allProducts.length,
    topProducts,
    maxProductRevenue: Math.max(1, ...topProducts.map((product) => product.revenue)),
  };
}

function isInPeriod(value: string, period: AnalyticsPeriod) {
  const orderKey = mexicoDateKey(new Date(value));
  const todayKey = mexicoDateKey(new Date());
  if (period === "TODAY") return orderKey === todayKey;
  if (period === "MONTH") return orderKey.slice(0, 7) === todayKey.slice(0, 7);

  const [year, month, day] = todayKey.split("-").map(Number);
  const today = new Date(Date.UTC(year, month - 1, day));
  const daysSinceMonday = (today.getUTCDay() + 6) % 7;
  today.setUTCDate(today.getUTCDate() - daysSinceMonday);
  return orderKey >= today.toISOString().slice(0, 10) && orderKey <= todayKey;
}

function mexicoDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function periodLabel(period: AnalyticsPeriod) {
  return period === "TODAY" ? "Hoy" : period === "WEEK" ? "Semana" : "Mes";
}

function playOrderAlert(context: AudioContext) {
  void context.resume();
  const now = context.currentTime;
  const melody = [
    { delay: 0, frequency: 740 },
    { delay: .24, frequency: 880 },
    { delay: .48, frequency: 1040 },
    { delay: .82, frequency: 880 },
    { delay: 1.08, frequency: 1120 },
  ];
  melody.forEach(({ delay, frequency }) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, now + delay);
    gain.gain.setValueAtTime(.0001, now + delay);
    gain.gain.exponentialRampToValueAtTime(.28, now + delay + .03);
    gain.gain.exponentialRampToValueAtTime(.0001, now + delay + .22);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + delay);
    oscillator.stop(now + delay + .24);
  });
}

const styles: Record<string, CSSProperties> = {
  main: { minHeight: "100vh", padding: "28px clamp(16px, 4vw, 52px) 60px", background: "#0f0f0f", color: "white", fontFamily: "Arial, sans-serif" },
  header: { maxWidth: 1400, margin: "0 auto 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" },
  eyebrow: { margin: 0, color: "#facc15", fontSize: 12, fontWeight: 900, letterSpacing: 1.5 }, title: { margin: "5px 0", fontSize: "clamp(30px, 5vw, 48px)" }, subtitle: { margin: 0, color: "#a1a1aa" },
  headerActions: { display: "flex", gap: 10, alignItems: "center" }, homeLink: { padding: "11px 16px", color: "#facc15", textDecoration: "none", fontWeight: 800 }, logout: { padding: "11px 16px", border: "1px solid #52525b", borderRadius: 12, background: "#27272a", color: "white", cursor: "pointer" },
  soundButton: { padding: "11px 14px", border: "1px solid #52525b", borderRadius: 12, background: "#27272a", color: "white", fontWeight: 800, cursor: "pointer" }, soundButtonActive: { borderColor: "#16a34a", background: "#14532d", color: "#dcfce7" },
  liveStatus: { maxWidth: 1400, margin: "0 auto 16px", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", color: "#a1a1aa", fontSize: 12 },
  analyticsSection: { maxWidth: 1400, margin: "0 auto 26px", padding: "clamp(16px, 3vw, 26px)", border: "1px solid #3f3f46", borderRadius: 22, background: "linear-gradient(145deg, #18181b, #111827)" }, analyticsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 18 }, analyticsEyebrow: { margin: 0, color: "#facc15", fontSize: 11, fontWeight: 900, letterSpacing: 1.4 }, analyticsTitle: { margin: "4px 0 0", fontSize: 26 }, periodButtons: { display: "flex", gap: 6, padding: 4, borderRadius: 13, background: "#09090b" }, periodButton: { padding: "9px 13px", border: 0, borderRadius: 10, background: "transparent", color: "#a1a1aa", fontWeight: 800, cursor: "pointer" }, periodButtonActive: { background: "#facc15", color: "#18181b" },
  analyticsCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }, metricCard: { padding: 15, borderRadius: 15, border: "1px solid #3f3f46", background: "#09090b" }, metricValue: { display: "block", color: "#facc15", fontSize: 25 }, metricLabel: { display: "block", marginTop: 3, fontWeight: 800 }, metricDetail: { display: "block", marginTop: 5, color: "#71717a" }, analyticsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))", gap: 12, marginTop: 12 }, chartCard: { padding: 16, borderRadius: 15, border: "1px solid #3f3f46", background: "#09090b" }, chartTitle: { margin: "0 0 14px", fontSize: 16 }, statusMetric: { marginTop: 12 }, statusMetricTop: { display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }, statusBarTrack: { height: 9, marginTop: 6, overflow: "hidden", borderRadius: 999, background: "#27272a" }, statusBarFill: { display: "block", height: "100%", borderRadius: 999 }, productMetric: { marginTop: 12 }, productMetricTop: { display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }, productBarTrack: { height: 7, marginTop: 5, overflow: "hidden", borderRadius: 999, background: "#27272a" }, productBarFill: { display: "block", height: "100%", borderRadius: 999, background: "#facc15" }, productMetricDetail: { color: "#71717a" }, noData: { color: "#71717a", fontSize: 13 }, analyticsFootnote: { margin: "14px 0 0", color: "#71717a", fontSize: 11, lineHeight: 1.45 }, ordersHeading: { maxWidth: 1400, margin: "0 auto 12px", fontSize: 22 },
  summary: { maxWidth: 1400, margin: "0 auto 16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }, summaryCard: { padding: 16, borderRadius: 16, background: "#18181b", border: "1px solid #3f3f46" }, summaryNumber: { display: "block", color: "#facc15", fontSize: 27, marginBottom: 3 },
  filters: { maxWidth: 1400, margin: "0 auto 12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 10 }, search: { padding: 13, borderRadius: 12, border: "1px solid #52525b", background: "#18181b", color: "white", fontSize: 15 }, select: { padding: 13, borderRadius: 12, border: "1px solid #52525b", background: "#18181b", color: "white" },
  toast: { position: "sticky", top: 10, zIndex: 20, maxWidth: 600, margin: "12px auto", padding: 12, borderRadius: 12, background: "#14532d", textAlign: "center" }, results: { maxWidth: 1400, margin: "14px auto", color: "#a1a1aa", fontSize: 13 },
  newOrderAlert: { position: "sticky", top: 10, zIndex: 30, maxWidth: 900, margin: "14px auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "16px 18px", border: "2px solid #facc15", borderRadius: 16, background: "#713f12", color: "#fef9c3", boxShadow: "0 16px 40px rgba(0,0,0,.45)" }, alertBell: { fontSize: 34 }, alertInfo: { display: "grid", gap: 4, flex: "1 1 240px" }, alertActions: { display: "flex", gap: 8, flexWrap: "wrap" }, confirmAlertButton: { padding: "11px 14px", border: 0, borderRadius: 11, background: "#16a34a", color: "white", fontWeight: 900, cursor: "pointer" }, rejectAlertButton: { padding: "11px 14px", border: "1px solid #fecaca", borderRadius: 11, background: "#991b1b", color: "white", fontWeight: 900, cursor: "pointer" },
  grid: { maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 430px), 1fr))", gap: 16 }, card: { padding: 20, border: "1px solid #3f3f46", borderRadius: 20, background: "#18181b" }, cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }, reference: { display: "block", color: "#facc15", fontSize: 16 }, date: { display: "block", marginTop: 4, color: "#a1a1aa", fontSize: 12 }, badges: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }, badge: { padding: "6px 9px", borderRadius: 999, color: "white", fontSize: 11, fontWeight: 900, whiteSpace: "nowrap" },
  fieldLabel: { display: "block", margin: "16px 0 6px", color: "#d4d4d8", fontSize: 12, fontWeight: 800 }, statusSelect: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid #52525b", background: "#27272a", color: "white", fontWeight: 800 }, customer: { marginTop: 14, padding: 15, borderRadius: 14, background: "#09090b" }, customerName: { margin: "0 0 6px", fontSize: 20 }, phone: { color: "#86efac", fontWeight: 800 }, address: { margin: "11px 0 7px", lineHeight: 1.45 }, detail: { margin: "6px 0", color: "#d4d4d8", fontSize: 13, lineHeight: 1.45 },
  quickActions: { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }, action: { display: "inline-block", padding: "9px 11px", border: "1px solid #52525b", borderRadius: 10, background: "#27272a", color: "white", fontSize: 12, fontWeight: 800, textDecoration: "none", cursor: "pointer" }, items: { marginTop: 14 }, itemRow: { display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid #3f3f46", color: "#e4e4e7", fontSize: 13 }, totalRow: { display: "flex", justifyContent: "space-between", gap: 12, marginTop: 15, fontSize: 20 }, receipt: { margin: "11px 0 0", color: "#a1a1aa", fontSize: 12 },
  notes: { boxSizing: "border-box", width: "100%", minHeight: 76, resize: "vertical", padding: 11, borderRadius: 12, border: "1px solid #52525b", background: "#09090b", color: "white", fontFamily: "inherit" }, save: { width: "100%", marginTop: 8, padding: 11, border: 0, borderRadius: 11, background: "#facc15", color: "#111", fontWeight: 900, cursor: "pointer" }, updated: { margin: "10px 0 0", color: "#71717a", fontSize: 11 }, empty: { maxWidth: 900, margin: "40px auto", padding: 30, border: "1px dashed #52525b", borderRadius: 20, color: "#a1a1aa", textAlign: "center" },
};
