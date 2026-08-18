import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";
import CashCut, { type PosSale } from "./CashCut";

export const dynamic = "force-dynamic";

export default async function CashCutPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) redirect("/admin/login");

  const sales = await supabaseAdminRequest<PosSale[]>(
    "orders?select=id,order_reference,payment_method,amount,created_at,fulfillment_status,items&order_channel=eq.POS&order=created_at.desc&limit=500"
  );

  return <CashCut initialSales={sales} />;
}
