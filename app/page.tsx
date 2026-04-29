"use client";

import { useState } from "react";

type Producto = {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  unidad: string;
  emoji: string;
};

const productos: Producto[] = [
  { id: 1, nombre: "Bistec de res", categoria: "Res", precio: 210, unidad: "kg", emoji: "🥩" },
  { id: 2, nombre: "Milanesa de res", categoria: "Res", precio: 220, unidad: "kg", emoji: "🥩" },
  { id: 3, nombre: "Carne molida", categoria: "Res", precio: 180, unidad: "kg", emoji: "🍖" },
  { id: 4, nombre: "Chuleta de cerdo", categoria: "Cerdo", precio: 145, unidad: "kg", emoji: "🐖" },
  { id: 5, nombre: "Chorizo casero", categoria: "Preparados", precio: 110, unidad: "kg", emoji: "🌶️" },
  { id: 6, nombre: "Paquete asador", categoria: "Paquetes", precio: 499, unidad: "paq", emoji: "🔥" },
];

export default function Home() {
  const [carrito, setCarrito] = useState<{ [key: number]: number }>({});
  const [categoria, setCategoria] = useState("Todos");

  const categorias = ["Todos", "Res", "Cerdo", "Preparados", "Paquetes"];

  const agregar = (id: number) => {
    setCarrito((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const quitar = (id: number) => {
    setCarrito((prev) => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));
  };

  const productosFiltrados =
    categoria === "Todos" ? productos : productos.filter((p) => p.categoria === categoria);

  const total = Object.entries(carrito).reduce((sum, [id, cantidad]) => {
    const p = productos.find((x) => x.id === Number(id));
    return sum + (p?.precio || 0) * cantidad;
  }, 0);

  const mensaje = encodeURIComponent(
    "Hola, quiero hacer este pedido:\n\n" +
      Object.entries(carrito)
        .filter(([, cantidad]) => cantidad > 0)
        .map(([id, cantidad]) => {
          const p = productos.find((x) => x.id === Number(id));
          return `- ${p?.nombre}: ${cantidad} ${p?.unidad} = $${(p?.precio || 0) * cantidad}`;
        })
        .join("\n") +
      `\n\nTotal aproximado: $${total}`
  );

  return (
    <main style={styles.main}>
      <section style={styles.header}>
        <h1 style={styles.title}>Carnicería La Lonja</h1>
        <p style={styles.subtitle}>Desde 1900 · Mercado Morelos</p>
        <h2 style={styles.hero}>Haz tu pedido fácil y rápido</h2>
      </section>

      <div style={styles.categorias}>
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            style={{
              ...styles.catBtn,
              background: categoria === cat ? "#b91c1c" : "#2b2b2b",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <section style={styles.grid}>
        {productosFiltrados.map((p) => (
          <div key={p.id} style={styles.card}>
            <div style={styles.emoji}>{p.emoji}</div>
            <h3>{p.nombre}</h3>
            <p style={styles.price}>${p.precio} / {p.unidad}</p>

            <div style={styles.controls}>
              <button onClick={() => quitar(p.id)} style={styles.smallBtn}>−</button>
              <b>{carrito[p.id] || 0}</b>
              <button onClick={() => agregar(p.id)} style={styles.smallBtn}>+</button>
            </div>
          </div>
        ))}
      </section>

      <section style={styles.cart}>
        <h2>Tu pedido</h2>
        <h3>Total: ${total}</h3>

        <a href={`https://wa.me/524613499246?text=${mensaje}`} target="_blank">
          <button style={styles.whatsapp}>Enviar pedido por WhatsApp</button>
        </a>
      </section>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    minHeight: "100vh",
    background: "#111",
    color: "white",
    padding: 20,
    fontFamily: "Arial",
  },
  header: {
    background: "linear-gradient(135deg, #7f1d1d, #111)",
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 32,
  },
  subtitle: {
    color: "#ddd",
  },
  hero: {
    fontSize: 24,
    marginTop: 20,
  },
  categorias: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  catBtn: {
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: 20,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 15,
  },
  card: {
    background: "#1f1f1f",
    padding: 18,
    borderRadius: 18,
    border: "1px solid #333",
  },
  emoji: {
    fontSize: 45,
  },
  price: {
    color: "#ddd",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: 15,
  },
  smallBtn: {
    background: "#b91c1c",
    color: "white",
    border: "none",
    width: 35,
    height: 35,
    borderRadius: 10,
    fontSize: 20,
    cursor: "pointer",
  },
  cart: {
    marginTop: 25,
    background: "#1f1f1f",
    padding: 20,
    borderRadius: 18,
  },
  whatsapp: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: 15,
    width: "100%",
    borderRadius: 14,
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer",
  },
};