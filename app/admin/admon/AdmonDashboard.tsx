"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdmonDashboardData } from "@/lib/admon-data";
import styles from "./admon.module.css";
import PushToggle from "./PushToggle";
import IncomingOrderAlert from "./IncomingOrderAlert";
import QuinielaControls from "./QuinielaControls";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("es-MX");

export default function AdmonDashboard({ initialData }: { initialData: AdmonDashboardData }) {
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<1 | 7 | 30>(initialData.periodDays);
  const [activityFilter, setActivityFilter] = useState<"all" | "carniceria" | "reproductor" | "quiniela">("all");

  const refresh = useCallback(async (selectedPeriod: 1 | 7 | 30 = period) => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/admin/admon?days=${selectedPeriod}`, { cache: "no-store" });
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("No fue posible actualizar Admon.");
      setData((await response.json()) as AdmonDashboardData);
    } finally {
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const visibleActivity = activityFilter === "all"
    ? data.recentActivity
    : data.recentActivity.filter((item) => item.project === activityFilter);
  const actionItems = getActionItems(data);
  const periodLabel = period === 1 ? "hoy" : `los últimos ${period} días`;

  return (
    <main className={styles.shell}>
      <IncomingOrderAlert />
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>CENTRO DE OPERACIONES</p>
          <h1>Admon</h1>
          <p>Actividad de La Lonja, el reproductor y la Quiniela en un solo lugar.</p>
        </div>
        <div className={styles.headerActions}>
          <PushToggle />
          <button type="button" onClick={() => void refresh()} disabled={refreshing}>
            {refreshing ? "Actualizando…" : "Actualizar ahora"}
          </button>
          <span className={styles.freshness}>
            <i className={refreshing ? styles.pulse : ""} />
            {refreshing ? "Actualizando" : `Actualizado ${formatTime(data.generatedAt)}`}
          </span>
          <a href="/admin/pos">Abrir punto de venta</a>
          <a href="/admin/productos">Administrar productos</a>
          <a href="/admin/pedidos">Ver pedidos</a>
          <form action="/admin/logout" method="post"><button type="submit">Salir</button></form>
        </div>
      </header>

      <nav className={styles.periodFilter} aria-label="Periodo del panel">
        <span>Mostrar datos de</span>
        {([1, 7, 30] as const).map((days) => <button type="button" key={days} className={period === days ? styles.activePeriod : ""} disabled={refreshing} onClick={() => { setPeriod(days); void refresh(days); }}>{days === 1 ? "Hoy" : `${days} días`}</button>)}
      </nav>

      <section className={styles.heroGrid} aria-label="Resumen general">
        <HeroMetric label="Pedidos hoy" value={data.carniceria.connected ? number.format(data.carniceria.ordersToday) : "—"} detail={`${data.carniceria.newOrders} nuevos por atender`} tone="red" />
        <HeroMetric label={`Ventas · ${period === 1 ? "hoy" : `${period} días`}`} value={data.carniceria.connected ? money.format(data.carniceria.salesWeek) : "—"} detail={`${data.carniceria.paidOrdersWeek} pedidos pagados`} tone="gold" />
        <HeroMetric label="Quinielas hoy" value={data.quiniela.connected ? number.format(data.quiniela.entriesToday) : "—"} detail={`${data.quiniela.entriesWeek} durante ${periodLabel}`} tone="blue" />
        <HeroMetric label="Clics de compra" value={data.reproductor.purchaseClicksWeek === null ? "—" : number.format(data.reproductor.purchaseClicksWeek)} detail={`Desde el reproductor durante ${periodLabel}`} tone="gray" />
      </section>

      <section className={styles.attention} aria-labelledby="attention-title">
        <div className={styles.attentionHead}>
          <div><p className={styles.eyebrow}>PRIORIDADES</p><h2 id="attention-title">Atención requerida</h2></div>
          <span>{actionItems.length ? `${actionItems.length} ${actionItems.length === 1 ? "asunto" : "asuntos"}` : "Todo en orden"}</span>
        </div>
        <div className={styles.attentionList}>
          {actionItems.length ? actionItems.map((item) => <article className={`${styles.attentionItem} ${styles[item.level]}`} key={item.id}>
            <i />
            <div><strong>{item.title}</strong><span>{item.detail}</span></div>
            {item.href && <a href={item.href}>{item.action} →</a>}
          </article>) : <article className={`${styles.attentionItem} ${styles.ok}`}><i /><div><strong>No hay pendientes importantes</strong><span>Los sitios responden y no se detectaron alertas operativas.</span></div></article>}
        </div>
      </section>

      <section className={styles.health} aria-label="Estado de los sitios">
        <div className={styles.healthIntro}>
          <p className={styles.eyebrow}>DISPONIBILIDAD</p>
          <h2>Estado de los sitios</h2>
        </div>
        {data.siteHealth.map((site) => <a href={site.url} target="_blank" rel="noreferrer" className={site.online ? styles.siteOnline : styles.siteOffline} key={site.project}>
          <i />
          <div><strong>{site.label}</strong><span>{site.online ? "En línea" : "No responde"}</span></div>
          <small>{site.responseMs === null ? "—" : `${number.format(site.responseMs)} ms`}</small>
        </a>)}
      </section>

      <section className={styles.projects}>
        <ProjectCard title="Carnicería La Lonja" status={data.carniceria.connected ? "Conectado" : "Requiere configuración"} connected={data.carniceria.connected} href="/admin/pedidos">
          <Metric label="Sesiones hoy" value={data.carniceria.sessionsToday ?? "—"} />
          <Metric label={`Páginas vistas · ${period === 1 ? "hoy" : `${period} días`}`} value={data.carniceria.pageViewsWeek ?? "—"} />
          <Metric label={`Pedidos · ${period === 1 ? "hoy" : `${period} días`}`} value={data.carniceria.ordersWeek} />
          <Metric label="Pedidos nuevos" value={data.carniceria.newOrders} alert={data.carniceria.newOrders > 0} />
          <Metric label={`Pagados · ${period === 1 ? "hoy" : `${period} días`}`} value={data.carniceria.paidOrdersWeek} />
          {data.carniceria.error && <Notice>{data.carniceria.error}</Notice>}
        </ProjectCard>

        <ProjectCard title="Reproductor MP3" status={data.reproductor.connected ? "Conectado" : "Pendiente de base de datos"} connected={data.reproductor.connected}>
          <Metric label="Sesiones hoy" value={data.reproductor.sessionsToday ?? "—"} />
          <Metric label={`Visitas de página · ${period === 1 ? "hoy" : `${period} días`}`} value={data.reproductor.pageViewsWeek ?? "—"} />
          <Metric label="Clics de compra hoy" value={data.reproductor.purchaseClicksToday ?? "—"} alert={(data.reproductor.purchaseClicksToday ?? 0) > 0} />
          <Metric label={`Clics de compra · ${period === 1 ? "hoy" : `${period} días`}`} value={data.reproductor.purchaseClicksWeek ?? "—"} />
          <Metric label={`Reproducciones · ${period === 1 ? "hoy" : `${period} días`}`} value={data.reproductor.playsWeek ?? "—"} />
          <Metric label="Destino con más clics" value={data.reproductor.topDestination ?? "Sin clics"} />
          <Notice>{data.reproductor.note}</Notice>
        </ProjectCard>

        <ProjectCard title="Quiniela La Lonja" status={data.quiniela.connected ? "Conectado" : "Sin conexión"} connected={data.quiniela.connected}>
          <Metric label="Sesiones hoy" value={data.quiniela.sessionsToday ?? "—"} />
          <Metric label={`Páginas vistas · ${period === 1 ? "hoy" : `${period} días`}`} value={data.quiniela.pageViewsWeek ?? "—"} />
          <Metric label="Jornadas abiertas" value={data.quiniela.openRounds} alert={data.quiniela.openRounds > 0} />
          <Metric label="Quinielas registradas" value={data.quiniela.totalEntries} />
          <Metric label={`Pagadas · ${period === 1 ? "hoy" : `${period} días`}`} value={data.quiniela.paidEntriesWeek} />
          <p className={styles.round}>{data.quiniela.latestRound ?? "Sin jornada registrada"}</p>
          {data.quiniela.error && <Notice>{data.quiniela.error}</Notice>}
        </ProjectCard>
      </section>

      <QuinielaControls />

      <section className={styles.conversions} aria-labelledby="conversion-title">
        <div className={styles.conversionIntro}>
          <p className={styles.eyebrow}>RESULTADOS</p>
          <h2 id="conversion-title">Conversión de {periodLabel}</h2>
          <p>Acciones registradas por cada 100 sesiones.</p>
        </div>
        <ConversionMetric label="Visitas que generan pedido" value={data.carniceria.conversionWeek} actions={data.carniceria.ordersWeek} sessions={data.carniceria.sessionsWeek} tone="carniceria" />
        <ConversionMetric label="Visitas que hacen clic para comprar" value={data.reproductor.conversionWeek} actions={data.reproductor.purchaseClicksWeek} sessions={data.reproductor.sessionsWeek} tone="reproductor" />
        <ConversionMetric label="Visitas que registran quiniela" value={data.quiniela.conversionWeek} actions={data.quiniela.entriesWeek} sessions={data.quiniela.sessionsWeek} tone="quiniela" />
      </section>

      <section className={styles.comparison} aria-labelledby="comparison-title">
        <div className={styles.comparisonIntro}>
          <p className={styles.eyebrow}>CAMBIO DEL PERIODO</p>
          <h2 id="comparison-title">Sesiones vs. periodo anterior</h2>
          <p>Compara el periodo elegido con el periodo inmediatamente anterior.</p>
        </div>
        {data.weeklyComparison.map((item) => <ComparisonMetric key={item.project} item={item} />)}
      </section>

      <TrafficChart trend={data.trafficTrend} periodLabel={periodLabel} />

      <HourlyActivity activity={data.hourlyActivity} periodLabel={periodLabel} />

      <section className={styles.audience} aria-labelledby="audience-title">
        <div className={styles.audienceIntro}>
          <p className={styles.eyebrow}>AUDIENCIA</p>
          <h2 id="audience-title">De dónde llegan y cómo entran</h2>
          <p>Sesiones de los tres proyectos durante {periodLabel}.</p>
        </div>
        <Distribution title="Origen del tráfico" items={data.audience.sources} />
        <Distribution title="Dispositivo" items={data.audience.devices} />
      </section>

      <section className={styles.activity} aria-labelledby="activity-title">
        <div className={styles.activityHead}>
          <div>
            <p className={styles.eyebrow}>EN VIVO</p>
            <h2 id="activity-title">Actividad reciente</h2>
          </div>
          <div className={styles.activityFilters} aria-label="Filtrar actividad por proyecto">
            {([['all', 'Todos'], ['carniceria', 'Carnicería'], ['reproductor', 'Reproductor'], ['quiniela', 'Quiniela']] as const).map(([value, label]) =>
              <button type="button" key={value} className={activityFilter === value ? styles.activeFilter : ""} onClick={() => setActivityFilter(value)}>{label}</button>
            )}
          </div>
        </div>
        <div className={styles.activityList}>
          {visibleActivity.length ? visibleActivity.map((item) => (
            <article className={styles.activityItem} key={item.id}>
              <i className={styles[item.project]} />
              <div>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </div>
              <small>{formatActivityTime(item.occurredAt)}</small>
            </article>
          )) : <p className={styles.emptyActivity}>No hay actividad reciente para este proyecto.</p>}
        </div>
      </section>

      <section className={styles.nextSteps}>
        <div>
          <p className={styles.eyebrow}>SIGUIENTE ETAPA</p>
          <h2>Completar el mapa de actividad</h2>
        </div>
        <ol>
          <li><b>Reproductor:</b> seguimiento activo de aperturas, reproducciones y clics de compra.</li>
          <li><b>Tres sitios:</b> registrar visitas y sesiones sin guardar información personal innecesaria.</li>
          <li><b>Avisos:</b> activos para pedidos, quinielas y clics de compra del reproductor.</li>
        </ol>
      </section>
    </main>
  );
}

function HeroMetric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return <article className={`${styles.heroMetric} ${styles[tone]}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function ProjectCard({ title, status, connected, href, children }: { title: string; status: string; connected: boolean; href?: string; children: React.ReactNode }) {
  return <article className={styles.projectCard}>
    <div className={styles.projectHead}><div><span className={styles.projectKicker}>PROYECTO</span><h2>{title}</h2></div><span className={connected ? styles.connected : styles.pending}><i />{status}</span></div>
    <div className={styles.metrics}>{children}</div>
    {href && <a className={styles.cardLink} href={href}>Abrir operación →</a>}
  </article>;
}

function Metric({ label, value, alert = false }: { label: string; value: string | number; alert?: boolean }) {
  return <div className={styles.metric}><span>{label}</span><strong className={alert ? styles.alert : ""}>{value}</strong></div>;
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className={styles.notice}>{children}</p>;
}

function ConversionMetric({ label, value, actions, sessions, tone }: { label: string; value: number | null; actions: number | null; sessions: number | null; tone: "carniceria" | "reproductor" | "quiniela" }) {
  return <article className={styles.conversionMetric}>
    <span>{label}</span>
    <strong className={styles[tone]}>{value === null ? "—" : `${number.format(value)}%`}</strong>
    <small>{number.format(actions ?? 0)} acciones / {number.format(sessions ?? 0)} sesiones</small>
  </article>;
}

function ComparisonMetric({ item }: { item: AdmonDashboardData["weeklyComparison"][number] }) {
  const direction = item.change === null || item.change === 0 ? "flat" : item.change > 0 ? "up" : "down";
  const changeLabel = item.change === null
    ? "Sin base anterior"
    : item.change === 0
      ? "Sin cambio"
      : `${item.change > 0 ? "↑" : "↓"} ${number.format(Math.abs(item.change))}%`;
  return <article className={styles.comparisonMetric}>
    <span>{item.label}</span>
    <div><strong>{number.format(item.current)}</strong><b className={styles[direction]}>{changeLabel}</b></div>
    <small>Antes: {number.format(item.previous)} sesiones</small>
  </article>;
}

function Distribution({ title, items }: { title: string; items: AdmonDashboardData["audience"]["sources"] }) {
  return <article className={styles.distribution}>
    <h3>{title}</h3>
    {items.length ? items.map((item) => <div className={styles.distributionRow} key={item.label}>
      <div><span>{item.label}</span><b>{number.format(item.sessions)} sesiones · {number.format(item.percentage)}%</b></div>
      <progress max="100" value={item.percentage}>{item.percentage}%</progress>
    </div>) : <p>Sin sesiones registradas.</p>}
  </article>;
}

function TrafficChart({ trend, periodLabel }: { trend: AdmonDashboardData["trafficTrend"]; periodLabel: string }) {
  const maximum = Math.max(1, ...trend.flatMap((day) => [day.carniceria, day.reproductor, day.quiniela]));
  return <section className={styles.traffic} aria-labelledby="traffic-title">
    <div className={styles.trafficHead}>
      <div><p className={styles.eyebrow}>TRÁFICO · {periodLabel.toUpperCase()}</p><h2 id="traffic-title">Sesiones por día</h2></div>
      <div className={styles.legend}><span><i className={styles.carniceria} />Carnicería</span><span><i className={styles.reproductor} />Reproductor</span><span><i className={styles.quiniela} />Quiniela</span></div>
    </div>
    <div className={styles.chart}>
      {trend.map((day) => <div className={styles.chartDay} key={day.date}>
        <div className={styles.bars} title={`${day.label}: Carnicería ${day.carniceria}, Reproductor ${day.reproductor}, Quiniela ${day.quiniela}`}>
          <i className={styles.carniceria} style={{ height: `${Math.max(3, day.carniceria / maximum * 100)}%` }}><b>{day.carniceria || ""}</b></i>
          <i className={styles.reproductor} style={{ height: `${Math.max(3, day.reproductor / maximum * 100)}%` }}><b>{day.reproductor || ""}</b></i>
          <i className={styles.quiniela} style={{ height: `${Math.max(3, day.quiniela / maximum * 100)}%` }}><b>{day.quiniela || ""}</b></i>
        </div>
        <span>{day.label}</span>
      </div>)}
    </div>
  </section>;
}

function HourlyActivity({ activity, periodLabel }: { activity: AdmonDashboardData["hourlyActivity"]; periodLabel: string }) {
  const maximum = Math.max(1, ...activity.map((item) => item.sessions));
  const peak = activity.reduce((best, item) => item.sessions > best.sessions ? item : best, activity[0]);
  return <section className={styles.hourly} aria-labelledby="hourly-title">
    <div className={styles.hourlyHead}>
      <div><p className={styles.eyebrow}>HORARIOS</p><h2 id="hourly-title">Horas con más movimiento</h2></div>
      <p>{peak?.sessions ? <>Hora más activa: <strong>{peak.label}</strong> con {number.format(peak.sessions)} sesiones</> : "Aún no hay sesiones suficientes."}</p>
    </div>
    <div className={styles.hourlyChart} aria-label={`Sesiones por hora durante ${periodLabel}`}>
      {activity.map((item) => <div className={styles.hourBar} key={item.hour} title={`${item.label}: ${item.sessions} sesiones`}>
        <i style={{ height: `${Math.max(2, item.sessions / maximum * 100)}%` }}><b>{item.sessions || ""}</b></i>
        {item.hour % 3 === 0 && <span>{item.label}</span>}
      </div>)}
    </div>
  </section>;
}

function getActionItems(data: AdmonDashboardData) {
  const items: Array<{ id: string; level: "urgent" | "warning" | "info"; title: string; detail: string; href?: string; action?: string }> = [];
  for (const site of data.siteHealth.filter((item) => !item.online)) {
    items.push({ id: `site-${site.project}`, level: "urgent", title: `${site.label} no responde`, detail: "El sitio no pasó la última revisión de disponibilidad.", href: site.url, action: "Revisar" });
  }
  if (data.carniceria.newOrders > 0) {
    items.push({ id: "orders", level: "urgent", title: `${data.carniceria.newOrders} ${data.carniceria.newOrders === 1 ? "pedido nuevo" : "pedidos nuevos"}`, detail: "Hay pedidos que todavía requieren atención.", href: "/admin/pedidos", action: "Atender" });
  }
  if (data.reproductor.purchaseClicksToday && data.reproductor.purchaseClicksToday > 0) {
    items.push({ id: "purchase-clicks", level: "info", title: `${data.reproductor.purchaseClicksToday} ${data.reproductor.purchaseClicksToday === 1 ? "clic de compra hoy" : "clics de compra hoy"}`, detail: "Hay personas mostrando intención de compra desde el reproductor." });
  }
  if (data.inventory.out > 0) {
    items.push({ id: "inventory-out", level: "urgent", title: `${data.inventory.out} ${data.inventory.out === 1 ? "producto agotado o negativo" : "productos agotados o negativos"}`, detail: data.inventory.alerts.filter((product) => product.stock <= 0).slice(0, 3).map((product) => product.name).join(", "), href: "/admin/productos", action: "Surtir" });
  }
  if (data.inventory.low > 0) {
    items.push({ id: "inventory-low", level: "warning", title: `${data.inventory.low} ${data.inventory.low === 1 ? "producto con existencia baja" : "productos con existencia baja"}`, detail: data.inventory.alerts.filter((product) => product.stock > 0).slice(0, 3).map((product) => product.name).join(", "), href: "/admin/productos", action: "Revisar" });
  }
  for (const comparison of data.weeklyComparison.filter((item) => item.previous >= 3 && item.change !== null && item.change <= -20)) {
    items.push({ id: `traffic-${comparison.project}`, level: "warning", title: `Bajó el tráfico de ${comparison.label}`, detail: `${number.format(Math.abs(comparison.change!))}% menos sesiones que la semana anterior.` });
  }
  if (data.quiniela.openRounds > 0) {
    items.push({ id: "rounds", level: "info", title: `${data.quiniela.openRounds} ${data.quiniela.openRounds === 1 ? "jornada abierta" : "jornadas abiertas"}`, detail: data.quiniela.latestRound ? `La más reciente es ${data.quiniela.latestRound}.` : "La Quiniela está recibiendo participaciones." });
  }
  return items;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function formatActivityTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
