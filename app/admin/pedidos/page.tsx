import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";
import OrdersDashboard, { type Order } from "./OrdersDashboard";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) redirect("/admin/login");

  const orders = await supabaseAdminRequest<Order[]>(
    "orders?select=*&order=created_at.desc&limit=100"
  );

  return <OrdersDashboard initialOrders={orders} />;
}
