"use client";

import { FormEvent, useMemo, useState } from "react";
import type { InventoryMovement } from "@/lib/inventory";
import type { ProductRow } from "@/lib/products";
import styles from "./productos.module.css";

type FormData = { id: string; name: string; category: string; price: string; unit: string; description: string; imageUrl: string; emoji: string; isActive: boolean; trackStock: boolean; stockQuantity: string; lowStockThreshold: string; blockOutOfStock: boolean };
const emptyForm: FormData = { id: "", name: "", category: "Cerdo", price: "", unit: "kg", description: "", imageUrl: "", emoji: "📦", isActive: true, trackStock: false, stockQuantity: "", lowStockThreshold: "1", blockOutOfStock: false };
const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
type MovementKind = "STOCK_ENTRY" | "WASTE" | "CORRECTION";

export default function ProductsAdmin({ initialProducts, initialMovements }: { initialProducts: ProductRow[]; initialMovements: InventoryMovement[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [movements, setMovements] = useState(initialMovements);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [editing, setEditing] = useState<ProductRow | null | "NEW">(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [inventoryProduct, setInventoryProduct] = useState<ProductRow | null>(null);
  const [movement, setMovement] = useState<{ kind: MovementKind; quantity: string; note: string }>({ kind: "STOCK_ENTRY", quantity: "", note: "" });
  const categories = useMemo(() => [...new Set(products.map((product) => product.category))].sort(), [products]);
  const visible = useMemo(() => {
    const needle = normalize(query);
    return products.filter((product) => (status === "ALL" || (status === "ACTIVE") === product.is_active) && (!needle || normalize(`${product.id} ${product.name} ${product.category}`).includes(needle)));
  }, [products, query, status]);

  function openNew() { setForm(emptyForm); setEditing("NEW"); setError(""); }
  function openEdit(product: ProductRow) {
    setForm({ id: product.id, name: product.name, category: product.category, price: String(product.price), unit: product.unit, description: product.description, imageUrl: product.image_url, emoji: product.emoji, isActive: product.is_active, trackStock: product.track_stock, stockQuantity: product.stock_quantity === null ? "" : String(product.stock_quantity), lowStockThreshold: String(product.low_stock_threshold), blockOutOfStock: product.block_out_of_stock });
    setEditing(product); setError("");
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const isNew = editing === "NEW";
      const response = await fetch("/api/admin/products", { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json() as ProductRow & { error?: string };
      if (!response.ok) throw new Error(result.error || "No fue posible guardar.");
      setProducts((current) => isNew ? [...current, result] : current.map((product) => product.id === result.id ? result : product));
      setEditing(null);
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "No fue posible guardar."); }
    finally { setSaving(false); }
  }
  async function toggle(product: ProductRow) {
    const next = !product.is_active;
    if (!next && !window.confirm(`¿Desactivar ${product.name}? Dejará de aparecer en tienda, POS y QR.`)) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: product.id, name: product.name, category: product.category, price: product.price, unit: product.unit, description: product.description, imageUrl: product.image_url, emoji: product.emoji, isActive: next, trackStock: product.track_stock, stockQuantity: product.stock_quantity, lowStockThreshold: product.low_stock_threshold, blockOutOfStock: product.block_out_of_stock }) });
      const result = await response.json() as ProductRow & { error?: string };
      if (!response.ok) throw new Error(result.error || "No fue posible actualizar.");
      setProducts((current) => current.map((item) => item.id === result.id ? result : item));
    } catch (toggleError) { setError(toggleError instanceof Error ? toggleError.message : "No fue posible actualizar."); }
    finally { setSaving(false); }
  }
  function openInventory(product: ProductRow) {
    if (!product.track_stock) {
      setError(`Activa “Controlar existencia” en ${product.name} antes de registrar movimientos.`);
      openEdit(product);
      return;
    }
    setInventoryProduct(product);
    setMovement({ kind: "STOCK_ENTRY", quantity: "", note: "" });
    setError("");
  }
  async function saveMovement(event: FormEvent) {
    event.preventDefault();
    if (!inventoryProduct) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/admin/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: inventoryProduct.id, ...movement }) });
      const result = await response.json() as { product?: ProductRow; movement?: InventoryMovement; error?: string };
      if (!response.ok || !result.product) throw new Error(result.error || "No fue posible guardar el movimiento.");
      setProducts((current) => current.map((product) => product.id === result.product!.id ? result.product! : product));
      if (result.movement) setMovements((current) => [result.movement!, ...current].slice(0, 60));
      setInventoryProduct(null);
    } catch (movementError) { setError(movementError instanceof Error ? movementError.message : "No fue posible guardar el movimiento."); }
    finally { setSaving(false); }
  }

  return <main className={styles.shell}>
    <header className={styles.header}>
      <div><span>CATÁLOGO CENTRAL</span><h1>Productos</h1><p>Los cambios se reflejan en la tienda, el POS y las etiquetas QR.</p></div>
      <nav><a href="/admin/admon">← Admon</a><a href="/admin/pos">Abrir POS</a><a href="/admin/proveedores">Proveedores</a><button onClick={openNew}>＋ Nuevo producto</button></nav>
    </header>
    <section className={styles.summary}><article><strong>{products.length}</strong><span>Total</span></article><article><strong>{products.filter((item) => item.is_active).length}</strong><span>Activos</span></article><article className={styles.alertMetric}><strong>{products.filter(isLowStock).length}</strong><span>Existencia baja</span></article><article className={styles.outMetric}><strong>{products.filter((item) => item.track_stock && Number(item.stock_quantity) <= 0).length}</strong><span>Agotados</span></article></section>
    <section className={styles.toolbar}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por producto, categoría o código…" /><div>{([['ALL','Todos'],['ACTIVE','Activos'],['INACTIVE','Desactivados']] as const).map(([value,label]) => <button key={value} className={status === value ? styles.activeFilter : ""} onClick={() => setStatus(value)}>{label}</button>)}</div></section>
    {error && !editing && <p className={styles.pageError}>{error}</p>}
    <section className={styles.grid}>{visible.map((product) => <article key={product.id} className={!product.is_active ? styles.inactive : ""}>
      <div className={styles.image}>{product.image_url ? <img src={product.image_url} alt="" /> : <span>{product.emoji}</span>}<i>{product.is_active ? "ACTIVO" : "DESACTIVADO"}</i></div>
      <div className={styles.info}><small>{product.id} · {product.category}</small><h2>{product.name}</h2><p>{product.description || "Sin descripción"}</p><div><strong>{money.format(Number(product.price))}</strong><span>/ {product.unit}</span></div>{product.track_stock && <div className={`${styles.stock} ${Number(product.stock_quantity) <= 0 ? styles.out : isLowStock(product) ? styles.low : ""}`}><b>{Number(product.stock_quantity).toLocaleString("es-MX", { maximumFractionDigits: 3 })} {product.unit}</b><span>{Number(product.stock_quantity) <= 0 ? "Agotado" : isLowStock(product) ? "Existencia baja" : "Disponible"}</span></div>}</div>
      <footer><button onClick={() => openInventory(product)}>{product.track_stock ? "＋ Inventario" : "Activar inventario"}</button><button onClick={() => openEdit(product)}>Editar</button><button className={product.is_active ? styles.disable : styles.enable} disabled={saving} onClick={() => void toggle(product)}>{product.is_active ? "Desactivar" : "Activar"}</button></footer>
    </article>)}</section>
    {!visible.length && <p className={styles.empty}>No hay productos que coincidan con este filtro.</p>}

    <details className={styles.history} open><summary><span>HISTORIAL DE INVENTARIO</span><strong>Últimos movimientos</strong><b>{movements.length}</b></summary>{movements.length ? <div className={styles.movementList}>{movements.map((item) => <article key={item.id}><div><strong>{item.product?.name || item.product_id}</strong><small>{movementLabel(item.movement_type)} · {new Date(item.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</small>{item.note && <p>{item.note}</p>}</div><b className={Number(item.quantity_change) >= 0 ? styles.positive : styles.negative}>{Number(item.quantity_change) >= 0 ? "+" : ""}{Number(item.quantity_change).toLocaleString("es-MX", { maximumFractionDigits: 3 })} {item.product?.unit}</b><span>Quedó: {Number(item.resulting_stock).toLocaleString("es-MX", { maximumFractionDigits: 3 })}</span></article>)}</div> : <p className={styles.emptyHistory}>Los movimientos aparecerán aquí al surtir, ajustar o vender productos con inventario activo.</p>}</details>

    {editing && <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><form className={styles.modal} onSubmit={save}>
      <button type="button" className={styles.close} onClick={() => setEditing(null)}>×</button><span>{editing === "NEW" ? "NUEVO PRODUCTO" : `EDITAR · ${form.id}`}</span><h2>{editing === "NEW" ? "Agregar al catálogo" : form.name}</h2>
      <div className={styles.formGrid}><label>Código<input value={form.id} disabled={editing !== "NEW"} required maxLength={40} onChange={(event) => setForm({ ...form, id: event.target.value.toUpperCase() })} placeholder="Ej. CERDO123" /></label><label>Emoji<input value={form.emoji} maxLength={16} onChange={(event) => setForm({ ...form, emoji: event.target.value })} /></label></div>
      <label>Nombre<input value={form.name} required maxLength={120} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <div className={styles.formGrid}><label>Categoría<input list="product-categories" value={form.category} required onChange={(event) => setForm({ ...form, category: event.target.value })} /><datalist id="product-categories">{categories.map((category) => <option key={category}>{category}</option>)}</datalist></label><label>Unidad<input value={form.unit} required onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="kg, paquete, pieza" /></label></div>
      <label>Precio<div className={styles.priceInput}><b>$</b><input type="number" min="0.01" max="1000000" step="0.01" inputMode="decimal" value={form.price} required onChange={(event) => setForm({ ...form, price: event.target.value })} /></div></label>
      <label>Descripción<textarea value={form.description} maxLength={600} rows={3} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <label>Enlace de imagen<input value={form.imageUrl} maxLength={1000} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://drive.google.com/…" /></label>
      <fieldset className={styles.inventory}><legend>Inventario</legend><label className={styles.check}><input type="checkbox" checked={form.trackStock} onChange={(event) => setForm({ ...form, trackStock: event.target.checked, blockOutOfStock: event.target.checked ? form.blockOutOfStock : false })} />Controlar existencia de este producto</label>{form.trackStock && <><div className={styles.formGrid}><label>Existencia actual ({form.unit})<input type="number" max="1000000" step="0.001" inputMode="decimal" value={form.stockQuantity} required onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} /></label><label>Avisarme cuando queden<input type="number" min="0" max="1000000" step="0.001" inputMode="decimal" value={form.lowStockThreshold} required onChange={(event) => setForm({ ...form, lowStockThreshold: event.target.value })} /></label></div><label className={styles.check}><input type="checkbox" checked={form.blockOutOfStock} onChange={(event) => setForm({ ...form, blockOutOfStock: event.target.checked })} />Bloquear la venta cuando no alcance la existencia</label></>}<small>El bloqueo es opcional. Si está apagado, el POS cobra normalmente y la existencia puede quedar negativa para señalar lo que falta.</small></fieldset>
      <label className={styles.check}><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Producto activo y visible</label>
      {error && <p className={styles.modalError}>{error}</p>}<button className={styles.save} disabled={saving}>{saving ? "Guardando…" : "Guardar producto"}</button>
    </form></div>}
    {inventoryProduct && <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setInventoryProduct(null); }}><form className={`${styles.modal} ${styles.movementModal}`} onSubmit={saveMovement}>
      <button type="button" className={styles.close} onClick={() => setInventoryProduct(null)}>×</button><span>MOVIMIENTO RÁPIDO</span><h2>{inventoryProduct.name}</h2><p className={styles.currentStock}>Existencia actual: <strong>{Number(inventoryProduct.stock_quantity).toLocaleString("es-MX", { maximumFractionDigits: 3 })} {inventoryProduct.unit}</strong></p>
      <div className={styles.movementKinds}>{([['STOCK_ENTRY','📦 Entrada'],['WASTE','✂️ Merma/salida'],['CORRECTION','✏️ Corrección']] as const).map(([kind,label]) => <button type="button" key={kind} className={movement.kind === kind ? styles.selectedKind : ""} onClick={() => setMovement({ ...movement, kind, quantity: "" })}>{label}</button>)}</div>
      <label>{movement.kind === "CORRECTION" ? `Nueva existencia exacta (${inventoryProduct.unit})` : `Cantidad (${inventoryProduct.unit})`}<input autoFocus type="number" min={movement.kind === "CORRECTION" ? undefined : "0.001"} max="1000000" step="0.001" inputMode="decimal" required value={movement.quantity} onChange={(event) => setMovement({ ...movement, quantity: event.target.value })} placeholder={movement.kind === "CORRECTION" ? "Ej. 8.500" : "Ej. 5"} /></label>
      <label>Nota opcional<input value={movement.note} maxLength={300} onChange={(event) => setMovement({ ...movement, note: event.target.value })} placeholder={movement.kind === "STOCK_ENTRY" ? "Ej. Llegó proveedor" : movement.kind === "WASTE" ? "Ej. Merma o consumo" : "Motivo de la corrección"} /></label>
      {error && <p className={styles.modalError}>{error}</p>}<button className={styles.save} disabled={saving}>{saving ? "Guardando…" : movement.kind === "STOCK_ENTRY" ? "Sumar existencia" : movement.kind === "WASTE" ? "Descontar existencia" : "Guardar existencia exacta"}</button>
    </form></div>}
  </main>;
}
function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function isLowStock(product: ProductRow) { return product.track_stock && Number(product.stock_quantity) > 0 && Number(product.stock_quantity) <= Number(product.low_stock_threshold); }
function movementLabel(kind: InventoryMovement["movement_type"]) { return { POS_SALE: "Venta POS", STOCK_ENTRY: "Entrada", WASTE: "Merma/salida", CORRECTION: "Corrección" }[kind]; }
