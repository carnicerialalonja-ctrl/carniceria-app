import Link from "next/link";

export default function PagoNoCompletado() {
  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <span style={styles.icon}>!</span>
        <p style={styles.eyebrow}>PAGO NO COMPLETADO</p>
        <h1 style={styles.title}>No se realizó ningún cobro</h1>
        <p style={styles.copy}>
          Puedes volver a tu pedido e intentarlo nuevamente o enviarlo directamente por WhatsApp.
        </p>
        <Link href="/#pedido" style={styles.primary}>Regresar a mi pedido</Link>
        <Link href="/" style={styles.secondary}>Ir al catálogo</Link>
      </section>
    </main>
  );
}

const styles = {
  main: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#0f0f0f", color: "white", fontFamily: "Arial, sans-serif" },
  card: { width: "min(520px, 100%)", padding: "38px 28px", border: "1px solid #3f3f46", borderRadius: 24, background: "#18181b", textAlign: "center" as const },
  icon: { display: "inline-grid", placeItems: "center", width: 68, height: 68, borderRadius: 999, background: "#b91c1c", fontSize: 38, fontWeight: 900 },
  eyebrow: { margin: "18px 0 8px", color: "#fca5a5", fontSize: 12, fontWeight: 900, letterSpacing: 1.4 },
  title: { margin: "0 0 14px", fontSize: 32 },
  copy: { margin: "0 0 24px", color: "#d4d4d8", lineHeight: 1.55 },
  primary: { display: "block", padding: 15, borderRadius: 14, background: "#b91c1c", color: "white", textDecoration: "none", fontWeight: 900 },
  secondary: { display: "inline-block", marginTop: 18, color: "#d4d4d8" },
};
