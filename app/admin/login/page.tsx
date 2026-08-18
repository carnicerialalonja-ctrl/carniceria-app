type LoginProps = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function AdminLogin({ searchParams }: LoginProps) {
  const { error, next } = await searchParams;
  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <div style={styles.logo}>La Lonja</div>
        <p style={styles.eyebrow}>ACCESO PRIVADO</p>
        <h1 style={styles.title}>Panel Admon</h1>
        <p style={styles.copy}>Escribe la contraseña administrativa que guardaste en Vercel.</p>
        <form action="/admin/session/login" method="post" style={styles.form}>
          {next && <input type="hidden" name="next" value={next} />}
          <label htmlFor="password" style={styles.label}>Contraseña</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" style={styles.input} />
          {error && <p style={styles.error}>La contraseña no es correcta.</p>}
          <button type="submit" style={styles.button}>Entrar a Admon</button>
        </form>
        <a href="/" style={styles.back}>Volver al catálogo</a>
      </section>
    </main>
  );
}

const styles = {
  main: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#0f0f0f", color: "white", fontFamily: "Arial, sans-serif" },
  card: { width: "min(440px, 100%)", padding: "34px 28px", border: "1px solid #3f3f46", borderRadius: 24, background: "#18181b", boxShadow: "0 25px 70px rgba(0,0,0,.45)" },
  logo: { color: "#facc15", fontSize: 25, fontWeight: 900 },
  eyebrow: { margin: "18px 0 7px", color: "#f87171", fontSize: 12, fontWeight: 900, letterSpacing: 1.5 },
  title: { margin: 0, fontSize: 32 },
  copy: { color: "#d4d4d8", lineHeight: 1.5 },
  form: { display: "grid", gap: 10, marginTop: 22 },
  label: { fontSize: 13, fontWeight: 800 },
  input: { padding: 14, border: "1px solid #52525b", borderRadius: 12, background: "#09090b", color: "white", fontSize: 17 },
  error: { margin: 0, padding: 10, borderRadius: 10, background: "#450a0a", color: "#fecaca", fontSize: 13 },
  button: { marginTop: 4, padding: 15, border: 0, borderRadius: 13, background: "#b91c1c", color: "white", fontSize: 16, fontWeight: 900, cursor: "pointer" },
  back: { display: "block", marginTop: 20, color: "#a1a1aa", textAlign: "center" as const },
};
