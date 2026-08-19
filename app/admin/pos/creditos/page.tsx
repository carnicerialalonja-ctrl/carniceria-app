import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";
import Receivables, { type CreditPayment, type CreditSale } from "./Receivables";

export const dynamic = "force-dynamic";

export default async function ReceivablesPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) redirect("/admin/login?next=%2Fadmin%2Fpos%2Fcreditos");

  const [sales, payments] = await Promise.all([
    supabaseAdminRequest<CreditSale[]>("orders?select=id,order_reference,customer_name,amount,created_at,credit_due_at,credit_status,items&order_channel=eq.POS&payment_method=eq.CREDIT&order=created_at.desc&limit=500"),
    supabaseAdminRequest<CreditPayment[]>("credit_payments?select=id,order_id,payment_method,amount,reference,received_at&order=received_at.desc&limit=500"),
  ]);

  return <Receivables initialSales={sales} payments={payments} />;
}
