"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./admon.module.css";

type Round = { id:string; nombre:string; estatus:string; activa:boolean; fecha_cierre:string|null; resultados_actualizados_at:string|null; generacion_error:string|null; generacion_actualizada_at:string|null; partidos:number; finalizados:number };

export default function QuinielaControls() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("Cargando control de jornadas…");
  const selected = useMemo(() => rounds.find((round) => round.id === selectedId) ?? rounds[0], [rounds, selectedId]);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/quiniela", { cache:"no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No fue posible cargar las jornadas.");
    setRounds(payload.jornadas);
    setSelectedId((current) => current || payload.jornadas[0]?.id || "");
    setMessage("");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load().catch((error) => setMessage(error.message)), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function generate() {
    if (!window.confirm("¿Buscar y generar automáticamente la siguiente Jornada de Liga MX?")) return;
    setWorking(true); setMessage("Guardando…");
    try {
      const response = await fetch("/api/admin/quiniela", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ action:"generate" }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No fue posible realizar la acción.");
      setRounds(payload.jornadas); setSelectedId(payload.jornadas[0]?.id || "");
      setMessage("Buscando los nueve partidos en Liga MX…");
      window.setTimeout(() => void load().catch((error) => setMessage(error.message)), 4_000);
      window.setTimeout(() => void load().catch((error) => setMessage(error.message)), 9_000);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Ocurrió un error."); }
    finally { setWorking(false); }
  }

  return <section className={styles.quinielaControl} aria-labelledby="quiniela-control-title">
    <div className={styles.quinielaControlHead}>
      <div><p className={styles.eyebrow}>OPERACIÓN</p><h2 id="quiniela-control-title">Control de Quiniela</h2></div>
      <button type="button" onClick={() => void load().then(() => setMessage("Revisión completada.")).catch((error) => setMessage(error.message))} disabled={working}>Revisar ahora</button>
    </div>
    <div className={styles.quinielaControlGrid}>
      <div className={styles.roundSelector}>
        <label>Jornada a controlar<select value={selected?.id ?? ""} onChange={(event) => setSelectedId(event.target.value)}>{rounds.map((round) => <option value={round.id} key={round.id}>{round.nombre}</option>)}</select></label>
        {selected && <div className={styles.roundStatus}><span>{selected.estatus}</span><b>{selected.finalizados}/{selected.partidos} partidos finalizados</b><small>Cierre: {selected.fecha_cierre ? new Date(selected.fecha_cierre).toLocaleString("es-MX") : "buscando horario…"}</small>{selected.generacion_error && <small style={{ color:"#9b2f27", fontWeight:700 }}>{selected.generacion_error}</small>}</div>}
      </div>
      <div className={styles.automaticRules}><strong>Estados automáticos</strong><span>Se abre al quedar completa · se cierra al iniciar el primer partido · se finaliza al terminar todos.</span></div>
      <div className={styles.generateRound} style={{ gridTemplateColumns:"1fr auto" }}>
        <div><strong>Generar la siguiente jornada automáticamente</strong><small>Descarga los nueve partidos, equipos, fechas y horarios publicados por Liga MX.</small></div>
        <button type="button" disabled={working} onClick={() => void generate()}>Agregar jornada nueva</button>
      </div>
    </div>
    {message && <p className={styles.controlMessage} role="status">{message}</p>}
  </section>;
}
