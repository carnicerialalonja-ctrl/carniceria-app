import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE,isAdminTokenValid } from "@/lib/admin-auth";
import { getProducts } from "@/lib/products";
import { supabaseAdminRequest } from "@/lib/supabase-admin";
import MerchandiseEntry from "./MerchandiseEntry";
export const dynamic="force-dynamic";
export default async function PurchasesPage(){
  if(!isAdminTokenValid((await cookies()).get(ADMIN_COOKIE)?.value))redirect("/admin/login?next=%2Fadmin%2Fcompras");
  const [suppliers,codes,products,receipts,payables]=await Promise.all([
    supabaseAdminRequest<Array<{id:string;name:string;allows_cash:boolean;allows_credit:boolean}>>("suppliers?select=id,name,allows_cash,allows_credit&active=eq.true&order=name.asc"),
    supabaseAdminRequest<Array<{supplier_id:string;supplier_code:string;product_id:string|null;supplier_description:string|null}>>("supplier_product_codes?select=supplier_id,supplier_code,product_id,supplier_description&active=eq.true"),
    getProducts(true),
    supabaseAdminRequest<Array<{id:string;receipt_number:string;supplier_id:string;payment_method:string;total_amount:number|string;received_at:string}>>("purchase_receipts?select=id,receipt_number,supplier_id,payment_method,total_amount,received_at&order=received_at.desc&limit=20"),
    supabaseAdminRequest<Array<{id:string;supplier_id:string;outstanding_amount:number|string;due_date:string;status:string}>>("supplier_payables?select=id,supplier_id,outstanding_amount,due_date,status&status=eq.PENDING&order=due_date.asc&limit=50")
  ]);
  return <MerchandiseEntry suppliers={suppliers} codes={codes} products={products.map(p=>({id:p.id,name:p.name,unit:p.unit,stock:Number(p.stock_quantity||0)}))} receipts={receipts} payables={payables}/>;
}
