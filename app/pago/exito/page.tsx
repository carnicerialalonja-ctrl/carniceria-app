import Link from "next/link";

export default function PagoExitoso() {
  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <span style={styles.icon}>✓</span>
        <p style={styles.eyebrow}>REGRESO DESDE CLIP</p>
        <h1 style={styles.title}>Recibimos tu proceso de pago</h1>
        <p style={styles.copy}>
          Confirma el cargo en tu comprobante de Clip. La Lonja revisará el pago y el peso real de tu pedido antes de la entrega.
        </p>
        <Link href="/#pedido" style={styles.primary}>Volver a mi pedido</Link>
        <Link href="/" style={styles.secondary}>Ir al catálogo</Link>
      </section>
    </main>
  );
}

const styles = {
  main: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#0f0f0f", color: "white", fontFamily: "Arial, sans-serif" },
  card: { width: "min(520px, 100%)", padding: "38px 28px", border: "1px solid #3f3f46", borderRadius: 24, background: "#18181b", textAlign: "center" as const },
  icon: { display: "inline-grid", placeItems: "center", width: 68, height: 68, borderRadius: 999, background: "#16a34a", fontSize: 38, fontWeight: 900 },
  eyebrow: { margin: "18px 0 8px", color: "#facc15", fontSize: 12, fontWeight: 900, letterSpacing: 1.4 },
  title: { margin: "0 0 14px", fontSize: 32 },
  copy: { margin: "0 0 24px", color: "#d4d4d8", lineHeight: 1.55 },
  primary: { display: "block", padding: 15, borderRadius: 14, background: "#ff5a1f", color: "white", textDecoration: "none", fontWeight: 900 },
  secondary: { display: "inline-block", marginTop: 18, color: "#d4d4d8" },
};
