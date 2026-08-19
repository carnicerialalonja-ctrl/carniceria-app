import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

type Body = Record<string, unknown>;
type Result = { receiptId:string; receiptNumber:string; total:number; newStock:number };

export async function POST(request:Request) {
  if (!isAdminTokenValid((await cookies()).get(ADMIN_COOKIE)?.value)) return Response.json({error:"Sesión no autorizada."},{status:401});
  try {
    const body=await request.json() as Body;
    const supplierId=text(body.supplierId,80), productId=text(body.productId,40).toUpperCase();
    const quantity=Number(body.quantity), unitCost=Number(body.unitCost), payment=text(body.paymentMethod,10).toUpperCase(), dueDate=date(body.dueDate);
    if(!supplierId||!/^[A-Z0-9_-]{2,40}$/.test(productId)) return Response.json({error:"Selecciona proveedor y producto."},{status:400});
    if(!Number.isFinite(quantity)||quantity<=0||quantity>1_000_000) return Response.json({error:"Escribe un peso o cantidad válido."},{status:400});
    if(!Number.isFinite(unitCost)||unitCost<0||unitCost>1_000_000) return Response.json({error:"Escribe un costo válido."},{status:400});
    if(!new Set(["CASH","CREDIT"]).has(payment)) return Response.json({error:"Forma de pago no válida."},{status:400});
    if(payment==="CREDIT"&&!dueDate) return Response.json({error:"Selecciona la fecha de pago del crédito."},{status:400});
    const result=await supabaseAdminRequest<Result>("rpc/receive_supplier_merchandise",{method:"POST",body:JSON.stringify({
      p_supplier_id:supplierId,p_product_id:productId,p_quantity:Math.round(quantity*1000)/1000,p_unit_cost:Math.round(unitCost*100)/100,
      p_payment_method:payment,p_due_date:dueDate,p_supplier_code:text(body.supplierCode,120)||null,p_raw_code:text(body.rawCode,300)||null,
      p_description:text(body.description,180)||null,p_lot_number:text(body.lotNumber,100)||null,p_packed_at:date(body.packedAt),
      p_expires_at:date(body.expiresAt),p_supplier_document:text(body.supplierDocument,100)||null,p_notes:text(body.notes,300)||null
    })});
    return Response.json(result);
  } catch(error) {
    const detail=error instanceof Error?error.message:"";
    const known=Object.entries({SUPPLIER_NOT_FOUND:"Proveedor no encontrado.",PRODUCT_NOT_FOUND:"Producto no encontrado.",PAYMENT_NOT_ALLOWED:"Ese proveedor no tiene habilitada esa forma de pago.",DUE_DATE_REQUIRED:"Falta la fecha de pago."}).find(([key])=>detail.includes(key));
    console.error("No fue posible registrar la compra.",error);
    return Response.json({error:known?.[1]||"No fue posible registrar la entrada de mercancía."},{status:known?400:500});
  }
}
function text(value:unknown,max:number){return String(value??"").trim().slice(0,max)}
function date(value:unknown){const result=text(value,10);return /^\d{4}-\d{2}-\d{2}$/.test(result)?result:null}
