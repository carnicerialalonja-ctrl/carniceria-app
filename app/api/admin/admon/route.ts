import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { getAdmonDashboardData } from "@/lib/admon-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) {
    return Response.json({ error: "Sesión no válida." }, { status: 401 });
  }

  const requestedDays = Number(new URL(request.url).searchParams.get("days"));
  const periodDays = requestedDays === 1 || requestedDays === 30 ? requestedDays : 7;
  const data = await getAdmonDashboardData(periodDays);
  return Response.json(data, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
