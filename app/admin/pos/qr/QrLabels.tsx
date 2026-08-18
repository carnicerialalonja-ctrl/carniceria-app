"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import styles from "./qr.module.css";

type Product = { id: string; nombre: string; categoria: string; precio: number; unidad: string };
type PrintFormat = "SHEET" | "BROTHER";

export default function QrLabels({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set(products.map((product) => product.id)));
  const [format, setFormat] = useState<PrintFormat>("BROTHER");
  const visible = useMemo(() => {
    const needle = normalize(query);
    return products.filter((product) => !needle || normalize(`${product.id} ${product.nombre} ${product.categoria}`).includes(needle));
  }, [products, query]);
  const printable = products.filter((product) => selected.has(product.id));

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectVisible() {
    setSelected((current) => new Set([...current, ...visible.map((product) => product.id)]));
  }

  function clearVisible() {
    const visibleIds = new Set(visible.map((product) => product.id));
    setSelected((current) => new Set([...current].filter((id) => !visibleIds.has(id))));
  }

  function downloadQr(product: Product) {
    const svg = document.getElementById(`qr-svg-${product.id}`);
    if (!(svg instanceof SVGElement)) return;
    const source = new XMLSerializer().serializeToString(svg);
    const image = new Image();
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1200;
      const context = canvas.getContext("2d");
      if (!context) return URL.revokeObjectURL(url);
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const link = document.createElement("a");
      link.download = `QR-${safeFileName(product.nombre)}-${product.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }

  return <main className={`${styles.shell} ${format === "BROTHER" ? styles.brother : styles.sheet}`}>
    {format === "BROTHER" && <style>{"@media print{@page{size:62mm 40mm;margin:0}}"}</style>}
    <header className={styles.header}>
      <div><span>IDENTIFICACIÓN DE PRODUCTOS</span><h1>Etiquetas QR</h1><p>El QR contiene únicamente el código que reconoce el Punto de Venta.</p></div>
      <nav><a href="/admin/pos">← Regresar al POS</a><a href="/admin/admon">Admon</a></nav>
    </header>

    <section className={styles.controls}>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto, categoría o código…" />
      <label>Formato<select value={format} onChange={(event) => setFormat(event.target.value as PrintFormat)}><option value="SHEET">Hoja normal A4/carta</option><option value="BROTHER">Brother QL-800 · rollo 62 mm</option></select></label>
      <div><button type="button" onClick={selectVisible}>Seleccionar visibles</button><button type="button" onClick={clearVisible}>Quitar visibles</button></div>
      <button type="button" className={styles.printButton} disabled={!printable.length} onClick={() => window.print()}>🖨️ Imprimir {printable.length} etiquetas</button>
      <small>{format === "BROTHER" ? "Configurado para cinta continua de 62 mm con corte cada 40 mm. En el diálogo selecciona 62 mm Continuous, no 29 × 90 mm." : "Para imprimir solo una categoría, búscala, pulsa “Quitar visibles” según necesites y selecciona las etiquetas deseadas."}</small>
    </section>

    <section className={styles.selector}>
      {visible.map((product) => <label key={product.id} className={selected.has(product.id) ? styles.selected : ""}><input type="checkbox" checked={selected.has(product.id)} onChange={() => toggle(product.id)} /><span>{product.nombre}</span><small>{product.id} · {product.categoria}</small></label>)}
    </section>

    <section className={styles.labels} aria-label="Vista previa de etiquetas">
      {printable.map((product) => <article className={styles.label} key={product.id}>
        <div className={styles.brand}>LA LONJA <small>DESDE 1900</small></div>
        <QRCodeSVG id={`qr-svg-${product.id}`} value={`https://la-lonja-celaya-oficial.vercel.app/admin/pos?producto=${encodeURIComponent(product.id)}`} size={116} level="M" marginSize={4} title={`Abrir ${product.nombre} en el POS`} />
        <div className={styles.labelInfo}><strong>{product.nombre}</strong><span>{product.id}</span><b>{product.categoria}</b></div>
        <button type="button" className={styles.download} onClick={() => downloadQr(product)}>Descargar PNG</button>
      </article>)}
    </section>
  </main>;
}

function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function safeFileName(value: string) { return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
