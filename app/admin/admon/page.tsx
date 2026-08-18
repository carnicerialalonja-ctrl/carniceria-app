import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { getAdmonDashboardData } from "@/lib/admon-data";
import AdmonDashboard from "./AdmonDashboard";

export const dynamic = "force-dynamic";

export default async function AdmonPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) redirect("/admin/login");

  return <AdmonDashboard initialData={await getAdmonDashboardData()} />;
}
