"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./pos.module.css";

type Product = {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  unidad: string;
  emoji: string;
  trackStock: boolean;
  stockQuantity: number | null;
  lowStockThreshold: number;
  blockOutOfStock: boolean;
};

type CartItem = Product & { quantity: number };
type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "CREDIT";
type CompletedSale = { orderId: string; orderReference: string; total: number; paymentMethod: PaymentMethod };
type FiscalForm = { rfc: string; legalName: string; postalCode: string; taxRegime: string; cfdiUse: string; email: string };

const emptyFiscalForm: FiscalForm = { rfc: "", legalName: "", postalCode: "", taxRegime: "", cfdiUse: "G03", email: "" };

const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export default function PosTerminal({ products, initialProductId }: { products: Product[]; initialProductId?: string }) {
  const [query, setQuery] = useState("");
  const [scanCode, setScanCode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [received, setReceived] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [creditDays, setCreditDays] = useState("7");
  const [transferReference, setTransferReference] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [weightProduct, setWeightProduct] = useState<Product | null>(null);
  const [weightValue, setWeightValue] = useState("");
  const [weightPriceValue, setWeightPriceValue] = useState("");
  const [priceItem, setPriceItem] = useState<CartItem | null>(null);
  const [priceValue, setPriceValue] = useState("");
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [fiscalForm, setFiscalForm] = useState<FiscalForm>(emptyFiscalForm);
  const [invoiceSaving, setInvoiceSaving] = useState(false);
  const [invoiceMessage, setInvoiceMessage] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const scanRef = useRef<HTMLInputElement>(null);
  const initialProductHandled = useRef(false);

  useEffect(() => { scanRef.current?.focus(); }, []);
  useEffect(() => {
    if (!initialProductId || initialProductHandled.current) return;
    initialProductHandled.current = true;
    const timer = window.setTimeout(() => {
      const product = products.find((item) => normalize(item.id) === normalize(initialProductId));
      if (product) addProduct(product, true);
      else setError(`No encontré el producto “${initialProductId}”.`);
    }, 0);
    return () => window.clearTimeout(timer);
    // El producto inicial solo se procesa una vez al abrir el POS desde un QR.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProductId, products]);

  const normalizedQuery = normalize(query);
  const results = useMemo(() => products.filter((product) =>
    !normalizedQuery || normalize(`${product.id} ${product.nombre} ${product.categoria}`).includes(normalizedQuery)
  ), [normalizedQuery, products]);
  const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  const receivedNumber = Number(received);
  const change = paymentMethod === "CASH" && Number.isFinite(receivedNumber) ? receivedNumber - total : 0;

  function addProduct(product: Product, editWeight = false) {
    if (product.trackStock && product.blockOutOfStock && Number(product.stockQuantity) <= 0) {
      setError(`${product.nombre} está agotado. Ajusta su existencia en Productos.`);
      return;
    }
    const step = product.unidad.toLowerCase() === "kg" ? 0.5 : 1;
    const isWeightEdit = editWeight && product.unidad.toLowerCase() === "kg";
    const existingQuantity = cart.find((item) => item.id === product.id)?.quantity;
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (isWeightEdit && existing) return current;
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: round(item.quantity + step) } : item)
        : [...current, { ...product, quantity: step }];
    });
    setMessage(`${product.nombre} agregado`);
    setError("");
    window.setTimeout(() => setMessage(""), 1400);
    if (isWeightEdit) {
      setWeightProduct(product);
      setWeightValue(String(existingQuantity ?? step));
      setWeightPriceValue(String(cart.find((item) => item.id === product.id)?.precio ?? product.precio));
    }
  }

  function scan(event: FormEvent) {
    event.preventDefault();
    const code = productCodeFromScan(scanCode.trim());
    if (!code) return;
    const product = products.find((item) => normalize(item.id) === normalize(code));
    if (!product) {
      setError(`No encontré el código “${code}”. Busca el producto por nombre.`);
    } else {
      addProduct(product, true);
    }
    setScanCode("");
    window.setTimeout(() => scanRef.current?.focus(), 0);
  }

  function changeQuantity(id: string, quantity: number) {
    const target = cart.find((item) => item.id === id);
    const next = round(quantity);
    if (target?.trackStock && target.blockOutOfStock && target.stockQuantity !== null && next > target.stockQuantity) {
      setError(`Solo quedan ${target.stockQuantity} ${target.unidad} de ${target.nombre}.`);
      return;
    }
    setError("");
    setCart((current) => quantity <= 0 ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, quantity: next } : item));
  }

  function openWeightEditor(item: CartItem) {
    setWeightProduct(item);
    setWeightValue(String(item.quantity));
    setWeightPriceValue(String(item.precio));
  }

  function saveWeight() {
    if (!weightProduct) return;
    const quantity = Number(weightValue);
    const price = Number(weightPriceValue);
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1000 || !Number.isFinite(price) || price <= 0 || price > 10000) {
      setError("Escribe un peso y precio válidos.");
      return;
    }
    if (weightProduct.trackStock && weightProduct.blockOutOfStock && weightProduct.stockQuantity !== null && quantity > weightProduct.stockQuantity) {
      setError(`Solo quedan ${weightProduct.stockQuantity} ${weightProduct.unidad} de ${weightProduct.nombre}.`);
      return;
    }
    setCart((current) => current.map((item) => item.id === weightProduct.id ? { ...item, quantity: round(quantity), precio: round(price) } : item));
    setWeightProduct(null);
    setWeightValue("");
    setWeightPriceValue("");
    setError("");
    window.setTimeout(() => scanRef.current?.focus(), 0);
  }

  function openPriceEditor(item: CartItem) {
    setPriceItem(item);
    setPriceValue(String(item.precio));
  }

  function savePrice() {
    if (!priceItem) return;
    const price = Number(priceValue);
    if (!Number.isFinite(price) || price <= 0 || price > 10000) {
      setError("Escribe un precio válido mayor a cero.");
      return;
    }
    setCart((current) => current.map((item) => item.id === priceItem.id ? { ...item, precio: round(price) } : item));
    setPriceItem(null);
    setPriceValue("");
    setError("");
    window.setTimeout(() => scanRef.current?.focus(), 0);
  }

  async function completeSale() {
    setError("");
    setMessage("");
    if (!cart.length) return setError("Agrega al menos un producto.");
    if (paymentMethod === "CASH" && (!Number.isFinite(receivedNumber) || receivedNumber < total)) return setError("El efectivo recibido es menor que el total.");
    if (paymentMethod === "CARD" && !window.confirm(`Confirma que la terminal aprobó el cobro de ${currency.format(total)}.`)) return;
    if (paymentMethod === "TRANSFER" && !window.confirm(`Confirma que recibiste la transferencia de ${currency.format(total)}.`)) return;
    if (paymentMethod === "CREDIT" && customerName.trim().length < 3) return setError("Escribe el nombre del cliente que se lleva la venta a crédito.");

    const ticketWindow = window.open("", "_blank", "width=420,height=700");
    if (ticketWindow) {
      ticketWindow.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Preparando ticket</title></head><body style="font-family:Arial;text-align:center;padding:30px"><b>Preparando ticket…</b></body></html>');
      ticketWindow.document.close();
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/pos/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          cashReceived: paymentMethod === "CASH" ? receivedNumber : undefined,
          customerName: paymentMethod === "CREDIT" ? customerName : undefined,
          creditDays: paymentMethod === "CREDIT" ? Number(creditDays) : undefined,
          transferReference: paymentMethod === "TRANSFER" ? transferReference : undefined,
          items: cart.map((item) => ({ id: item.id, quantity: item.quantity, unitPrice: item.precio })),
        }),
      });
      const result = await response.json() as { orderId?: string; orderReference?: string; change?: number; error?: string };
      if (!response.ok || !result.orderId || !result.orderReference) throw new Error(result.error || "No fue posible registrar la venta.");
      const saleCart = cart;
      setCompletedSale({ orderId: result.orderId, orderReference: result.orderReference, total, paymentMethod });
      setInvoiceMessage("");
      setInvoiceError("");
      setMessage(`Venta ${result.orderReference} registrada${paymentMethod === "CASH" ? ` · Cambio ${currency.format(result.change || 0)}` : ""}.`);
      setCart([]);
      setReceived("");
      setCustomerName("");
      setCreditDays("7");
      setTransferReference("");
      printTicket(result.orderReference, saleCart, total, paymentMethod, result.change || 0, ticketWindow);
    } catch (saleError) {
      ticketWindow?.close();
      setError(saleError instanceof Error ? saleError.message : "No fue posible registrar la venta.");
    } finally {
      setSaving(false);
      window.setTimeout(() => scanRef.current?.focus(), 0);
    }
  }

  async function requestInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!completedSale) return;
    setInvoiceSaving(true);
    setInvoiceError("");
    setInvoiceMessage("");
    try {
      const response = await fetch("/api/admin/pos/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: completedSale.orderId, ...fiscalForm }),
      });
      const result = await response.json() as { invoiceRequestId?: string; error?: string };
      if (!response.ok || !result.invoiceRequestId) throw new Error(result.error || "No fue posible guardar la solicitud.");
      setInvoiceMessage(`Datos fiscales guardados para ${completedSale.orderReference}. Ya aparece en Facturas pendientes para capturarlo gratis en el SAT.`);
    } catch (invoiceRequestError) {
      setInvoiceError(invoiceRequestError instanceof Error ? invoiceRequestError.message : "No fue posible guardar la solicitud.");
    } finally {
      setInvoiceSaving(false);
    }
  }

  return <main className={styles.shell}>
    <header className={styles.header}>
      <div><span>PUNTO DE VENTA</span><h1>La Lonja</h1><p>Escanea, cobra y registra ventas de mostrador.</p></div>
      <nav><a href="/admin/admon">← Admon</a><a href="/admin/pos/caja">Abrir/cerrar caja</a><a href="/admin/compras">Entrada de mercancía</a><a href="/admin/proveedores">Proveedores</a><a href="/admin/pos/creditos">Cuentas por cobrar</a><a href="/admin/pos/facturas">Facturas pendientes</a><a href="/admin/pos/corte">Corte del día</a><a href="/admin/pos/qr">Imprimir QR</a><a href="/admin/pedidos">Ventas y pedidos</a></nav>
    </header>

    <section className={styles.workspace}>
      <div className={styles.catalogPanel}>
        <form onSubmit={scan} className={styles.scanner}>
          <label htmlFor="scan-code">Escáner QR o código</label>
          <div><input ref={scanRef} id="scan-code" value={scanCode} onChange={(event) => setScanCode(event.target.value)} placeholder="Escanea aquí y presiona Enter" autoComplete="off" /><button>Agregar</button></div>
          <small>Los lectores USB/Bluetooth funcionan como teclado. El QR debe contener el código del producto.</small>
        </form>
        <input className={styles.search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto por nombre, categoría o código…" />
        <div className={styles.products}>
          {results.map((product) => <button type="button" key={product.id} onClick={() => addProduct(product)} disabled={product.trackStock && product.blockOutOfStock && Number(product.stockQuantity) <= 0} className={styles.product}>
            <span>{product.emoji}</span><div><strong>{product.nombre}</strong><small>{product.id} · {product.categoria}</small>{product.trackStock && <em className={Number(product.stockQuantity) <= product.lowStockThreshold ? styles.lowStock : ""}>{Number(product.stockQuantity).toLocaleString("es-MX", { maximumFractionDigits: 3 })} {product.unidad} disponibles</em>}</div><b>{currency.format(product.precio)}<small>/{product.unidad}</small></b>
          </button>)}
        </div>
      </div>

      <aside className={styles.ticket}>
        <div className={styles.ticketHead}><div><span>VENTA ACTUAL</span><h2>Cuenta</h2></div><button type="button" onClick={() => setCart([])} disabled={!cart.length}>Limpiar</button></div>
        <div className={styles.items}>
          {cart.length ? cart.map((item) => {
            const step = item.unidad.toLowerCase() === "kg" ? 0.5 : 1;
            return <article key={item.id}><div><strong>{item.nombre}</strong><button type="button" className={styles.priceButton} onClick={() => openPriceEditor(item)} aria-label={`Editar precio de ${item.nombre}`}>{currency.format(item.precio)} / {item.unidad} ✎</button></div><div className={styles.quantity}><button type="button" onClick={() => changeQuantity(item.id, item.quantity - step)}>−</button>{item.unidad.toLowerCase() === "kg" ? <button type="button" className={styles.weightButton} onClick={() => openWeightEditor(item)} aria-label={`Editar peso de ${item.nombre}`}>{item.quantity} kg ✎</button> : <input aria-label={`Cantidad de ${item.nombre}`} type="number" min={step} step={step} value={item.quantity} onChange={(event) => changeQuantity(item.id, Number(event.target.value))} />}<button type="button" onClick={() => changeQuantity(item.id, item.quantity + step)}>+</button></div><b>{currency.format(item.precio * item.quantity)}</b></article>;
          }) : <p className={styles.empty}>Escanea un producto o selecciónalo del catálogo.</p>}
        </div>
        <div className={styles.total}><span>Total</span><strong>{currency.format(total)}</strong></div>
        <div className={styles.paymentTabs}>
          <button type="button" className={paymentMethod === "CASH" ? styles.active : ""} onClick={() => setPaymentMethod("CASH")}>💵 Efectivo</button>
          <button type="button" className={paymentMethod === "CARD" ? styles.active : ""} onClick={() => setPaymentMethod("CARD")}>💳 Tarjeta</button>
          <button type="button" className={paymentMethod === "TRANSFER" ? styles.active : ""} onClick={() => setPaymentMethod("TRANSFER")}>🏦 Transferencia</button>
          <button type="button" className={paymentMethod === "CREDIT" ? styles.active : ""} onClick={() => setPaymentMethod("CREDIT")}>🕐 Crédito</button>
        </div>
        {paymentMethod === "CASH" && <div className={styles.cash}><label>Efectivo recibido<input type="number" min={total} step="0.01" inputMode="decimal" value={received} onChange={(event) => setReceived(event.target.value)} placeholder="$0.00" /></label><div className={change >= 0 ? styles.change : styles.short}><span>{change >= 0 ? "Cambio" : "Faltan"}</span><strong>{currency.format(Math.abs(change))}</strong></div></div>}
        {paymentMethod === "CARD" && <p className={styles.cardNotice}>Cobra {currency.format(total)} en la terminal Clip. Cuando aparezca “Aprobado”, registra la venta.</p>}
        {paymentMethod === "TRANSFER" && <div className={styles.cash}><label>Referencia (opcional)<input value={transferReference} onChange={(event) => setTransferReference(event.target.value)} maxLength={80} placeholder="Folio o nombre del banco" /></label><p className={styles.paymentNotice}>Esta venta se registra pagada, pero no aumenta el efectivo esperado en caja.</p></div>}
        {paymentMethod === "CREDIT" && <div className={styles.creditFields}><label>Cliente<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} maxLength={120} placeholder="Nombre del cliente" /></label><label>Plazo<select value={creditDays} onChange={(event) => setCreditDays(event.target.value)}><option value="7">7 días</option><option value="14">14 días</option><option value="21">21 días</option><option value="30">30 días</option></select></label><p>Quedará como cuenta pendiente; no se sumará al efectivo ni como venta cobrada.</p></div>}
        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.success}>{message}</p>}
        {completedSale && <button className={styles.invoiceButton} type="button" onClick={() => setInvoiceOpen(true)}>🧾 Facturar {completedSale.orderReference}</button>}
        <button className={styles.charge} type="button" disabled={saving || !cart.length} onClick={() => void completeSale()}>{saving ? "Guardando…" : paymentMethod === "CASH" ? `Cobrar ${currency.format(total)}` : paymentMethod === "CARD" ? `Confirmar tarjeta · ${currency.format(total)}` : paymentMethod === "TRANSFER" ? `Confirmar transferencia · ${currency.format(total)}` : `Registrar crédito · ${currency.format(total)}`}</button>
      </aside>
    </section>
    {weightProduct && <div className={styles.weightBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setWeightProduct(null); }}>
      <section className={styles.weightModal} role="dialog" aria-modal="true" aria-labelledby="weight-title">
        <div className={styles.weightHead}><div><span>PRODUCTO A GRANEL</span><h2 id="weight-title">{weightProduct.nombre}</h2></div><button type="button" onClick={() => setWeightProduct(null)} aria-label="Cerrar">×</button></div>
        <div className={styles.quickEditGrid}><label>Peso exacto
          <div className={styles.weightInput}><input autoFocus type="number" min="0.001" max="1000" step="0.001" inputMode="decimal" value={weightValue} onChange={(event) => setWeightValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveWeight(); }} /><b>kg</b></div>
        </label><label>Precio por kg
          <div className={styles.weightInput}><b>$</b><input type="number" min="0.01" max="10000" step="0.01" inputMode="decimal" value={weightPriceValue} onChange={(event) => setWeightPriceValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveWeight(); }} /></div>
        </label></div>
        <span className={styles.quickLabel}>PESO RÁPIDO</span>
        <div className={styles.weightPresets}>{[0.25, 0.5, 0.75, 1].map((weight) => <button type="button" key={weight} onClick={() => setWeightValue(String(weight))}>{weight < 1 ? `${weight * 1000} g` : `${weight} kg`}</button>)}</div>
        <span className={styles.quickLabel}>PRECIO RÁPIDO</span>
        <div className={styles.pricePresets}>{[90, 100, 110, 120].map((price) => <button type="button" key={price} onClick={() => setWeightPriceValue(String(price))}>${price}</button>)}</div>
        <div className={styles.weightAmount}><span>Total de este producto</span><strong>{currency.format((Number(weightPriceValue) || 0) * (Number(weightValue) || 0))}</strong></div>
        <button type="button" className={styles.weightSave} onClick={saveWeight}>✓ Agregar y seguir cobrando</button>
      </section>
    </div>}
    {priceItem && <div className={styles.weightBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPriceItem(null); }}>
      <section className={styles.weightModal} role="dialog" aria-modal="true" aria-labelledby="price-title">
        <div className={styles.weightHead}><div><span>PRECIO DE ESTA VENTA</span><h2 id="price-title">{priceItem.nombre}</h2></div><button type="button" onClick={() => setPriceItem(null)} aria-label="Cerrar">×</button></div>
        <label>Precio por {priceItem.unidad}
          <div className={styles.weightInput}><b>$</b><input autoFocus type="number" min="0.01" max="10000" step="0.01" inputMode="decimal" value={priceValue} onChange={(event) => setPriceValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") savePrice(); }} /></div>
        </label>
        <div className={styles.pricePresets}>{[90, 100, 110, 120].map((price) => <button type="button" key={price} onClick={() => setPriceValue(String(price))}>${price}</button>)}</div>
        <div className={styles.weightAmount}><span>Importe con {priceItem.quantity} {priceItem.unidad}</span><strong>{currency.format((Number(priceValue) || 0) * priceItem.quantity)}</strong></div>
        <button type="button" className={styles.weightSave} onClick={savePrice}>Aplicar precio a esta venta</button>
      </section>
    </div>}
    {invoiceOpen && completedSale && <div className={styles.weightBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setInvoiceOpen(false); }}>
      <section className={`${styles.weightModal} ${styles.invoiceModal}`} role="dialog" aria-modal="true" aria-labelledby="invoice-title">
        <div className={styles.weightHead}><div><span>FACTURACIÓN CFDI 4.0</span><h2 id="invoice-title">{completedSale.orderReference}</h2><p>{currency.format(completedSale.total)} · {completedSale.paymentMethod === "CASH" ? "Efectivo" : completedSale.paymentMethod === "CARD" ? "Tarjeta" : completedSale.paymentMethod === "TRANSFER" ? "Transferencia" : "Crédito pendiente"}</p></div><button type="button" onClick={() => setInvoiceOpen(false)} aria-label="Cerrar">×</button></div>
        <form className={styles.fiscalForm} onSubmit={(event) => void requestInvoice(event)}>
          <div className={styles.fiscalGrid}>
            <label>RFC<input autoFocus required minLength={12} maxLength={13} value={fiscalForm.rfc} onChange={(event) => setFiscalForm((current) => ({ ...current, rfc: event.target.value.toUpperCase().replace(/\s/g, "") }))} placeholder="XAXX010101000" /></label>
            <label>Código postal fiscal<input required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={fiscalForm.postalCode} onChange={(event) => setFiscalForm((current) => ({ ...current, postalCode: event.target.value.replace(/\D/g, "").slice(0, 5) }))} placeholder="38000" /></label>
          </div>
          <label>Nombre o razón social<input required minLength={3} maxLength={200} value={fiscalForm.legalName} onChange={(event) => setFiscalForm((current) => ({ ...current, legalName: event.target.value.toUpperCase() }))} placeholder="Como aparece en la constancia fiscal" /></label>
          <label>Régimen fiscal<select required value={fiscalForm.taxRegime} onChange={(event) => setFiscalForm((current) => ({ ...current, taxRegime: event.target.value }))}>
            <option value="">Seleccionar…</option><option value="601">601 · General de Ley Personas Morales</option><option value="603">603 · Personas Morales con Fines no Lucrativos</option><option value="605">605 · Sueldos y Salarios</option><option value="606">606 · Arrendamiento</option><option value="608">608 · Demás ingresos</option><option value="610">610 · Residentes en el Extranjero</option><option value="611">611 · Ingresos por Dividendos</option><option value="612">612 · Actividades Empresariales y Profesionales</option><option value="614">614 · Ingresos por intereses</option><option value="615">615 · Premios</option><option value="616">616 · Sin obligaciones fiscales</option><option value="621">621 · Incorporación Fiscal</option><option value="625">625 · Plataformas Tecnológicas</option><option value="626">626 · Régimen Simplificado de Confianza</option>
          </select></label>
          <label>Uso del CFDI<select required value={fiscalForm.cfdiUse} onChange={(event) => setFiscalForm((current) => ({ ...current, cfdiUse: event.target.value }))}><option value="G01">G01 · Adquisición de mercancías</option><option value="G02">G02 · Devoluciones, descuentos o bonificaciones</option><option value="G03">G03 · Gastos en general</option><option value="S01">S01 · Sin efectos fiscales</option><option value="CP01">CP01 · Pagos</option><option value="CN01">CN01 · Nómina</option></select></label>
          <label>Correo para enviar factura (opcional)<input type="email" maxLength={254} value={fiscalForm.email} onChange={(event) => setFiscalForm((current) => ({ ...current, email: event.target.value }))} placeholder="cliente@correo.com" /></label>
          <p className={styles.fiscalHint}>Captura los datos exactamente como aparecen en la Constancia de Situación Fiscal.</p>
          {invoiceError && <p className={styles.error}>{invoiceError}</p>}
          {invoiceMessage && <p className={styles.success}>{invoiceMessage}</p>}
          <button type="submit" className={styles.weightSave} disabled={invoiceSaving || Boolean(invoiceMessage)}>{invoiceSaving ? "Guardando…" : invoiceMessage ? "✓ Solicitud guardada" : "Guardar datos para facturar"}</button>
        </form>
      </section>
    </div>}
  </main>;
}

function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function round(value: number) { return Math.round(value * 1000) / 1000; }
function productCodeFromScan(value: string) {
  try { return new URL(value).searchParams.get("producto") || value; } catch { return value; }
}

function printTicket(reference: string, items: CartItem[], total: number, payment: PaymentMethod, change: number, popup: Window | null) {
  if (!popup) return;
  const rows = items.map((item) => `<tr><td colspan="3" class="name">${escapeHtml(item.nombre)}</td></tr><tr><td>${item.quantity} ${escapeHtml(item.unidad)}</td><td class="unit">× $${item.precio.toFixed(2)}/${escapeHtml(item.unidad)}</td><td>$${(item.precio * item.quantity).toFixed(2)}</td></tr>`).join("");
  const paymentLabel = payment === "CASH" ? "Efectivo" : payment === "CARD" ? "Tarjeta" : payment === "TRANSFER" ? "Transferencia" : "Crédito pendiente";
  popup.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${reference}</title><style>@page{size:80mm auto;margin:3mm}*{box-sizing:border-box}html,body{width:74mm;margin:0;padding:0}body{color:#111;background:#fff;font:12px/1.3 Arial,sans-serif}h1{margin:0;text-align:center;font-size:21px;text-transform:uppercase}p{text-align:center;margin:3px 0}.reference{margin-top:8px;font-size:14px;font-weight:900}.divider{margin:9px 0;border-top:1px dashed #111}table{width:100%;border-collapse:collapse;margin:8px 0}td{padding:3px 1px;vertical-align:top}td:last-child{text-align:right;white-space:nowrap}.name{padding-top:7px;font-weight:900;text-align:left!important}.unit{color:#444}.total{display:flex;justify-content:space-between;margin-top:7px;padding-top:7px;border-top:2px solid #111;font-size:20px;font-weight:900}.meta{margin-top:10px;padding-top:8px;border-top:1px dashed #111;text-align:left}.thanks{margin-top:12px;font-weight:900}@media print{html,body{width:74mm}}</style></head><body><h1>Carnicería La Lonja</h1><p>Mercado Morelos · Local interior 96</p><p class="reference">${reference}</p><p>${new Date().toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</p><div class="divider"></div><table>${rows}</table><div class="total"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div><div class="meta">Pago: <b>${paymentLabel}</b>${payment === "CASH" ? `<br>Cambio: <b>$${change.toFixed(2)}</b>` : ""}</div><p class="thanks">¡Gracias por su compra!</p><p>La Lonja · Tradición desde 1900</p><script>addEventListener("load",()=>{focus();print()})<\/script></body></html>`);
  popup.document.close();
}

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[character] || character); }
