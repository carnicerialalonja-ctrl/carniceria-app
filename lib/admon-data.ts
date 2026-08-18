import "server-only";

import { supabaseAdminRequest } from "@/lib/supabase-admin";

const QUINIELA_SUPABASE_URL =
  process.env.QUINIELA_SUPABASE_URL ?? "https://knmldlscatfiarlomxzn.supabase.co";
const QUINIELA_SUPABASE_KEY =
  process.env.QUINIELA_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_-UYTJHMwpYYVahiieMbDVw_0Q2SDFMr";

type OrderRow = {
  id: string;
  created_at: string;
  amount: number | string;
  clip_status: string;
  fulfillment_status: string;
};

type JornadaRow = {
  id: string;
  nombre: string;
  estatus: string;
  fecha_cierre: string | null;
};

type QuinielaRow = {
  id: string;
  created_at: string;
  tipo: string;
  importe: number | string | null;
  estatus_pago: string;
  jornada_id: string;
};

type AnalyticsEventRow = {
  project: "carniceria" | "reproductor" | "quiniela";
  occurred_at: string;
  event_name: "page_view" | "session_start" | "play" | "purchase_click";
  session_id: string;
  referrer: string | null;
  user_agent: string | null;
  metadata: Record<string, string> | null;
};

type InventoryProductRow = {
  id: string;
  name: string;
  unit: string;
  stock_quantity: number | string | null;
  low_stock_threshold: number | string;
  track_stock: boolean;
  is_active: boolean;
};

export type AdmonDashboardData = {
  generatedAt: string;
  periodDays: 1 | 7 | 30;
  siteHealth: Array<{
    project: "carniceria" | "reproductor" | "quiniela";
    label: string;
    url: string;
    online: boolean;
    status: number | null;
    responseMs: number | null;
  }>;
  trafficTrend: Array<{
    date: string;
    label: string;
    carniceria: number;
    reproductor: number;
    quiniela: number;
  }>;
  weeklyComparison: Array<{
    project: "carniceria" | "reproductor" | "quiniela";
    label: string;
    current: number;
    previous: number;
    change: number | null;
  }>;
  hourlyActivity: Array<{
    hour: number;
    label: string;
    sessions: number;
  }>;
  recentActivity: Array<{
    id: string;
    project: "carniceria" | "reproductor" | "quiniela";
    label: string;
    detail: string;
    occurredAt: string;
  }>;
  audience: {
    sources: Array<{ label: string; sessions: number; percentage: number }>;
    devices: Array<{ label: string; sessions: number; percentage: number }>;
  };
  inventory: {
    connected: boolean;
    tracked: number;
    low: number;
    out: number;
    alerts: Array<{ id: string; name: string; unit: string; stock: number }>;
  };
  carniceria: {
    connected: boolean;
    ordersToday: number;
    paidOrdersToday: number;
    salesToday: number;
    ordersWeek: number;
    newOrders: number;
    paidOrdersWeek: number;
    salesWeek: number;
    sessionsToday: number | null;
    sessionsWeek: number | null;
    conversionWeek: number | null;
    pageViewsWeek: number | null;
    error?: string;
  };
  reproductor: {
    connected: boolean;
    sessionsToday: number | null;
    sessionsWeek: number | null;
    conversionWeek: number | null;
    visitorsToday: number | null;
    pageViewsWeek: number | null;
    purchaseClicksToday: number | null;
    purchaseClicksWeek: number | null;
    playsWeek: number | null;
    playsToday: number | null;
    topDestination: string | null;
    note: string;
  };
  quiniela: {
    connected: boolean;
    openRounds: number;
    totalEntries: number;
    entriesToday: number;
    entriesWeek: number;
    paidEntriesWeek: number;
    revenueWeek: number;
    sessionsToday: number | null;
    sessionsWeek: number | null;
    conversionWeek: number | null;
    pageViewsWeek: number | null;
    latestRound: string | null;
    error?: string;
  };
};

function after(date: string, threshold: number) {
  const time = new Date(date).getTime();
  return Number.isFinite(time) && time >= threshold;
}

function isPaidOrder(order: OrderRow) {
  return order.clip_status === "CHECKOUT_COMPLETED";
}

function isPaidEntry(entry: QuinielaRow) {
  return ["pagado", "paid", "confirmado", "aprobado"].includes(
    String(entry.estatus_pago || "").toLowerCase()
  );
}

async function quinielaRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${QUINIELA_SUPABASE_URL}/rest/v1/${path}`, {
    cache: "no-store",
    headers: { apikey: QUINIELA_SUPABASE_KEY },
  });

  if (!response.ok) {
    throw new Error(`La Quiniela respondió ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function getAdmonDashboardData(periodDays: 1 | 7 | 30 = 7): Promise<AdmonDashboardData> {
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const periodStart = periodDays === 1 ? todayStart : now - periodDays * 24 * 60 * 60 * 1000;
  const periodDuration = now - periodStart;
  const previousPeriodStart = periodStart - periodDuration;

  const healthPromise = Promise.all([
    checkSite("carniceria", "Carnicería", "https://la-lonja-celaya-oficial.vercel.app"),
    checkSite("reproductor", "Reproductor", "https://la-lonja-music-station.vercel.app"),
    checkSite("quiniela", "Quiniela", "https://quiniela-la-lonja-dist.vercel.app"),
  ]);
  const [ordersResult, jornadasResult, quinielasResult, eventsResult, inventoryResult, healthResult] = await Promise.allSettled([
    supabaseAdminRequest<OrderRow[]>(
      `orders?select=id,created_at,amount,clip_status,fulfillment_status&created_at=gte.${encodeURIComponent(
        new Date(periodStart).toISOString()
      )}&order=created_at.desc&limit=2000`
    ),
    quinielaRequest<JornadaRow[]>(
      "jornadas?select=id,nombre,estatus,fecha_cierre&order=fecha_cierre.desc&limit=100"
    ),
    quinielaRequest<QuinielaRow[]>(
      "quinielas?select=id,created_at,tipo,importe,estatus_pago,jornada_id&order=created_at.desc&limit=2000"
    ),
    supabaseAdminRequest<AnalyticsEventRow[]>(
      `analytics_events?select=project,occurred_at,event_name,session_id,referrer,user_agent,metadata&occurred_at=gte.${encodeURIComponent(
        new Date(previousPeriodStart).toISOString()
      )}&order=occurred_at.desc&limit=5000`
    ),
    supabaseAdminRequest<InventoryProductRow[]>(
      "products?select=id,name,unit,stock_quantity,low_stock_threshold,track_stock,is_active&track_stock=eq.true&is_active=eq.true&order=stock_quantity.asc&limit=2000"
    ),
    healthPromise,
  ]);

  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
  const jornadas = jornadasResult.status === "fulfilled" ? jornadasResult.value : [];
  const quinielas = quinielasResult.status === "fulfilled" ? quinielasResult.value : [];
  const allEvents = eventsResult.status === "fulfilled" ? eventsResult.value : [];
  const inventoryProducts = inventoryResult.status === "fulfilled" ? inventoryResult.value : [];
  const inventoryAlerts = inventoryProducts
    .filter((product) => Number(product.stock_quantity) <= Number(product.low_stock_threshold))
    .map((product) => ({ id: product.id, name: product.name, unit: product.unit, stock: Number(product.stock_quantity) }));
  const events = allEvents.filter((event) => after(event.occurred_at, periodStart));
  const previousEvents = allEvents.filter((event) => {
    const occurredAt = new Date(event.occurred_at).getTime();
    return Number.isFinite(occurredAt) && occurredAt >= previousPeriodStart && occurredAt < periodStart;
  });
  const carniceriaEvents = events.filter((event) => event.project === "carniceria");
  const reproductorEvents = events.filter((event) => event.project === "reproductor");
  const quinielaEvents = events.filter((event) => event.project === "quiniela");
  const paidOrders = orders.filter(isPaidOrder);
  const carniceriaSessionsWeek = uniqueSessions(carniceriaEvents);
  const reproductorSessionsWeek = uniqueSessions(reproductorEvents);
  const quinielaSessionsWeek = uniqueSessions(quinielaEvents);
  const purchaseClicksWeek = reproductorEvents.filter((event) => event.event_name === "purchase_click").length;
  const entriesWeek = quinielas.filter((entry) => after(entry.created_at, periodStart)).length;
  const paidEntries = quinielas.filter(
    (entry) => after(entry.created_at, periodStart) && isPaidEntry(entry)
  );
  const openRounds = jornadas.filter((round) =>
    ["abierta", "abierto", "open"].includes(String(round.estatus).toLowerCase())
  );
  const recentActivity = [
    ...events.map((event, index) => ({
      id: `event-${event.occurred_at}-${index}`,
      project: event.project,
      label: eventLabel(event.event_name),
      detail: eventDetail(event),
      occurredAt: event.occurred_at,
    })),
    ...orders.map((order) => ({
      id: `order-${order.id}`,
      project: "carniceria" as const,
      label: "Pedido registrado",
      detail: `$${Number(order.amount || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      occurredAt: order.created_at,
    })),
    ...quinielas.map((entry) => ({
      id: `quiniela-${entry.id}`,
      project: "quiniela" as const,
      label: "Quiniela registrada",
      detail: entry.tipo || "Nueva participación",
      occurredAt: entry.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 20);
  const trafficTrend = buildTrafficTrend(events, now, periodDays);
  const audience = buildAudience(events);
  const weeklyComparison = ([
    ["carniceria", "Carnicería"],
    ["reproductor", "Reproductor"],
    ["quiniela", "Quiniela"],
  ] as const).map(([project, label]) => {
    const current = uniqueSessions(events.filter((event) => event.project === project));
    const previous = uniqueSessions(previousEvents.filter((event) => event.project === project));
    return { project, label, current, previous, change: percentageChange(current, previous) };
  });
  const hourlyActivity = buildHourlyActivity(events);

  return {
    generatedAt: new Date(now).toISOString(),
    periodDays,
    siteHealth: healthResult.status === "fulfilled" ? healthResult.value : [],
    trafficTrend,
    weeklyComparison,
    hourlyActivity,
    recentActivity,
    audience,
    inventory: {
      connected: inventoryResult.status === "fulfilled",
      tracked: inventoryProducts.length,
      low: inventoryAlerts.filter((product) => product.stock > 0).length,
      out: inventoryAlerts.filter((product) => product.stock <= 0).length,
      alerts: inventoryAlerts.slice(0, 20),
    },
    carniceria: {
      connected: ordersResult.status === "fulfilled",
      ordersToday: orders.filter((order) => after(order.created_at, todayStart)).length,
      paidOrdersToday: paidOrders.filter((order) => after(order.created_at, todayStart)).length,
      salesToday: paidOrders.filter((order) => after(order.created_at, todayStart)).reduce((sum, order) => sum + Number(order.amount || 0), 0),
      ordersWeek: orders.length,
      newOrders: orders.filter((order) => order.fulfillment_status === "NEW").length,
      paidOrdersWeek: paidOrders.length,
      salesWeek: paidOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
      sessionsToday: eventsResult.status === "fulfilled"
        ? new Set(carniceriaEvents.filter((event) => after(event.occurred_at, todayStart)).map((event) => event.session_id)).size
        : null,
      sessionsWeek: eventsResult.status === "fulfilled" ? carniceriaSessionsWeek : null,
      conversionWeek: eventsResult.status === "fulfilled" ? conversionRate(orders.length, carniceriaSessionsWeek) : null,
      pageViewsWeek: eventsResult.status === "fulfilled"
        ? carniceriaEvents.filter((event) => event.event_name === "page_view").length
        : null,
      ...(ordersResult.status === "rejected"
        ? { error: "Falta conectar el Supabase de la carnicería en este entorno." }
        : {}),
    },
    reproductor: {
      connected: eventsResult.status === "fulfilled",
      sessionsToday: eventsResult.status === "fulfilled"
        ? new Set(reproductorEvents.filter((event) => after(event.occurred_at, todayStart)).map((event) => event.session_id)).size
        : null,
      sessionsWeek: eventsResult.status === "fulfilled" ? reproductorSessionsWeek : null,
      conversionWeek: eventsResult.status === "fulfilled" ? conversionRate(purchaseClicksWeek, reproductorSessionsWeek) : null,
      visitorsToday: eventsResult.status === "fulfilled"
        ? new Set(reproductorEvents.filter((event) => after(event.occurred_at, todayStart)).map((event) => event.session_id)).size
        : null,
      pageViewsWeek: eventsResult.status === "fulfilled"
        ? reproductorEvents.filter((event) => event.event_name === "page_view").length
        : null,
      purchaseClicksToday: eventsResult.status === "fulfilled"
        ? reproductorEvents.filter((event) => event.event_name === "purchase_click" && after(event.occurred_at, todayStart)).length
        : null,
      purchaseClicksWeek: eventsResult.status === "fulfilled"
        ? purchaseClicksWeek
        : null,
      playsWeek: eventsResult.status === "fulfilled"
        ? reproductorEvents.filter((event) => event.event_name === "play").length
        : null,
      playsToday: eventsResult.status === "fulfilled"
        ? reproductorEvents.filter((event) => event.event_name === "play" && after(event.occurred_at, todayStart)).length
        : null,
      topDestination: eventsResult.status === "fulfilled"
        ? mostCommonDestination(reproductorEvents)
        : null,
      note: eventsResult.status === "fulfilled"
        ? "Seguimiento activo: sesiones, reproducciones y clics de compra."
        : "La instrumentación está lista; falta aplicar la migración y configurar el endpoint al publicar.",
    },
    quiniela: {
      connected:
        jornadasResult.status === "fulfilled" && quinielasResult.status === "fulfilled",
      openRounds: openRounds.length,
      totalEntries: quinielas.length,
      entriesToday: quinielas.filter((entry) => after(entry.created_at, todayStart)).length,
      entriesWeek: quinielas.filter((entry) => after(entry.created_at, periodStart)).length,
      paidEntriesWeek: paidEntries.length,
      revenueWeek: paidEntries.reduce((sum, entry) => sum + Number(entry.importe || 0), 0),
      sessionsToday: eventsResult.status === "fulfilled"
        ? new Set(quinielaEvents.filter((event) => after(event.occurred_at, todayStart)).map((event) => event.session_id)).size
        : null,
      sessionsWeek: eventsResult.status === "fulfilled" ? quinielaSessionsWeek : null,
      conversionWeek: eventsResult.status === "fulfilled" ? conversionRate(entriesWeek, quinielaSessionsWeek) : null,
      pageViewsWeek: eventsResult.status === "fulfilled"
        ? quinielaEvents.filter((event) => event.event_name === "page_view").length
        : null,
      latestRound: openRounds[0]?.nombre ?? jornadas[0]?.nombre ?? null,
      ...(jornadasResult.status === "rejected" || quinielasResult.status === "rejected"
        ? { error: "No fue posible leer los datos de la Quiniela." }
        : {}),
    },
  };
}

function mostCommonDestination(events: AnalyticsEventRow[]) {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.event_name !== "purchase_click") continue;
    const destination = event.metadata?.destination;
    if (destination) counts.set(destination, (counts.get(destination) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function uniqueSessions(events: AnalyticsEventRow[]) {
  return new Set(events.map((event) => event.session_id)).size;
}

function conversionRate(actions: number, sessions: number) {
  return sessions > 0 ? Math.round(actions / sessions * 1000) / 10 : null;
}

function percentageChange(current: number, previous: number) {
  return previous > 0 ? Math.round((current - previous) / previous * 1000) / 10 : null;
}

function buildHourlyActivity(events: AnalyticsEventRow[]) {
  const sessionsByHour = Array.from({ length: 24 }, () => new Set<string>());
  const hourFormatter = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    hourCycle: "h23",
  });

  for (const event of events) {
    const date = new Date(event.occurred_at);
    if (!Number.isFinite(date.getTime())) continue;
    const hour = Number(hourFormatter.formatToParts(date).find((part) => part.type === "hour")?.value);
    if (Number.isInteger(hour) && hour >= 0 && hour < 24) {
      sessionsByHour[hour].add(`${event.project}:${event.session_id}`);
    }
  }

  return sessionsByHour.map((sessions, hour) => ({
    hour,
    label: `${String(hour).padStart(2, "0")}:00`,
    sessions: sessions.size,
  }));
}

function eventLabel(eventName: AnalyticsEventRow["event_name"]) {
  return {
    page_view: "Visita al sitio",
    session_start: "Nueva sesión",
    play: "Reproducción iniciada",
    purchase_click: "Clic de compra",
  }[eventName];
}

function eventDetail(event: AnalyticsEventRow) {
  if (event.event_name === "purchase_click") return event.metadata?.destination || "Enlace de compra";
  if (event.event_name === "play") return event.metadata?.source === "spotify" ? "Spotify" : "Archivo local";
  return projectName(event.project);
}

function projectName(project: AnalyticsEventRow["project"]) {
  return { carniceria: "Carnicería", reproductor: "Reproductor", quiniela: "Quiniela" }[project];
}

function buildTrafficTrend(events: AnalyticsEventRow[], now: number, periodDays: number) {
  const days = Array.from({ length: periodDays }, (_, index) => {
    const date = new Date(now - (periodDays - 1 - index) * 24 * 60 * 60 * 1000);
    return {
      date: mexicoDateKey(date),
      label: new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", timeZone: "America/Mexico_City" }).format(date),
      carniceria: new Set<string>(),
      reproductor: new Set<string>(),
      quiniela: new Set<string>(),
    };
  });
  const byDate = new Map(days.map((day) => [day.date, day]));
  for (const event of events) {
    const day = byDate.get(mexicoDateKey(new Date(event.occurred_at)));
    if (day) day[event.project].add(event.session_id);
  }
  return days.map((day) => ({
    date: day.date,
    label: day.label.replace(".", ""),
    carniceria: day.carniceria.size,
    reproductor: day.reproductor.size,
    quiniela: day.quiniela.size,
  }));
}

function mexicoDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Mexico_City",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function buildAudience(events: AnalyticsEventRow[]) {
  const sessions = new Map<string, AnalyticsEventRow>();
  for (const event of events) {
    if (!sessions.has(event.session_id) || event.event_name === "session_start") sessions.set(event.session_id, event);
  }
  const sourceCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  for (const event of sessions.values()) {
    const source = trafficSource(event.referrer);
    const device = deviceType(event.user_agent);
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
    deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1);
  }
  return { sources: distribution(sourceCounts, sessions.size), devices: distribution(deviceCounts, sessions.size) };
}

function trafficSource(referrer: string | null) {
  if (!referrer) return "Directo";
  const value = referrer.toLowerCase();
  if (/google|bing|yahoo|duckduckgo/.test(value)) return "Buscadores";
  if (/facebook|instagram|tiktok|twitter|x\.com|youtube/.test(value)) return "Redes sociales";
  if (/whatsapp|wa\.me/.test(value)) return "WhatsApp";
  return "Otros sitios";
}

function deviceType(userAgent: string | null) {
  const value = (userAgent ?? "").toLowerCase();
  if (/ipad|tablet|kindle/.test(value)) return "Tablet";
  if (/mobile|iphone|android/.test(value)) return "Celular";
  return "Computadora";
}

function distribution(counts: Map<string, number>, total: number) {
  return [...counts.entries()]
    .map(([label, sessions]) => ({ label, sessions, percentage: total ? Math.round(sessions / total * 1000) / 10 : 0 }))
    .sort((a, b) => b.sessions - a.sessions);
}

async function checkSite(project: "carniceria" | "reproductor" | "quiniela", label: string, url: string) {
  const startedAt = performance.now();
  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    return {
      project,
      label,
      url,
      online: response.ok,
      status: response.status,
      responseMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return { project, label, url, online: false, status: null, responseMs: null };
  }
}
