import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "lonja_pedidos_admin";
const TOKEN_VALUE = "pedidos-admin-autorizado";

function password() {
  const value = process.env.PEDIDOS_ADMIN_PASSWORD;
  if (!value) throw new Error("Falta PEDIDOS_ADMIN_PASSWORD.");
  return value;
}

export function createAdminToken() {
  return createHmac("sha256", password()).update(TOKEN_VALUE).digest("hex");
}

export function isAdminTokenValid(token?: string) {
  if (!token) return false;
  const expected = createAdminToken();
  const receivedBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function isAdminPasswordValid(candidate: string) {
  const expectedBuffer = Buffer.from(password());
  const receivedBuffer = Buffer.from(candidate);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}
