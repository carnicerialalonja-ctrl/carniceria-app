import "server-only";

const QUINIELA_URL = process.env.QUINIELA_SUPABASE_URL ?? "https://knmldlscatfiarlomxzn.supabase.co";
const QUINIELA_KEY = process.env.QUINIELA_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_-UYTJHMwpYYVahiieMbDVw_0Q2SDFMr";

export async function quinielaAdminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${QUINIELA_URL}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: { apikey: QUINIELA_KEY, "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`La Quiniela respondió ${response.status}: ${detail.slice(0, 240)}`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
