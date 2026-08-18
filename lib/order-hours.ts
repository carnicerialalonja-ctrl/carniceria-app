export const ORDER_TIME_ZONE = "America/Mexico_City";
export const ORDER_HOURS_LABEL = "8:00 a. m. a 4:00 p. m.";

const OPENING_MINUTES = 8 * 60;
const CLOSING_MINUTES = 16 * 60;

export type OrderHoursStatus = {
  isOpen: boolean;
  message: string;
};

export function getOrderHoursStatus(now = new Date()): OrderHoursStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ORDER_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const currentMinutes = hour * 60 + minute;
  const isOpen = currentMinutes >= OPENING_MINUTES && currentMinutes < CLOSING_MINUTES;

  return {
    isOpen,
    message: isOpen
      ? "Pedidos abiertos hoy hasta las 4:00 p. m."
      : `Pedidos cerrados. Nuestro horario para recibir pedidos es de ${ORDER_HOURS_LABEL}.`,
  };
}
