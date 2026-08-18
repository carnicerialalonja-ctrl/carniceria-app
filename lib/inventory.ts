import "server-only";

import { supabaseAdminRequest } from "@/lib/supabase-admin";

export type InventoryMovement = {
  id: number;
  product_id: string;
  order_id: string | null;
  quantity_change: number | string;
  resulting_stock: number | string;
  movement_type: "POS_SALE" | "STOCK_ENTRY" | "WASTE" | "CORRECTION";
  note: string | null;
  created_at: string;
  product: { name: string; unit: string } | null;
};

export function getInventoryMovements(limit = 60) {
  const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit)));
  return supabaseAdminRequest<InventoryMovement[]>(
    `inventory_movements?select=id,product_id,order_id,quantity_change,resulting_stock,movement_type,note,created_at,product:products(name,unit)&order=created_at.desc&limit=${safeLimit}`
  );
}
