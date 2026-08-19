import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";
import InvoiceQueue, { type InvoiceOrder, type InvoiceRequest } from "./InvoiceQueue";

export const dynamic = "force-dynamic";

export default async function InvoiceQueuePage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) redirect("/admin/login?next=%2Fadmin%2Fpos%2Ffacturas");

  const [requests, orders] = await Promise.all([
    supabaseAdminRequest<InvoiceRequest[]>("invoice_requests?select=id,order_id,order_reference,status,rfc,legal_name,postal_code,tax_regime,cfdi_use,email,payment_form,payment_method,amount,sale_snapshot,fiscal_uuid,sat_folio,admin_notes,stamped_at,created_at&order=created_at.desc&limit=500"),
    supabaseAdminRequest<InvoiceOrder[]>("orders?select=id,payment_method,credit_status,credit_due_at,paid_at&order_channel=eq.POS&order=created_at.desc&limit=500"),
  ]);
  return <InvoiceQueue initialRequests={requests} orders={orders} />;
}
