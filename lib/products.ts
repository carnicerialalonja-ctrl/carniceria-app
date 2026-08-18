import { supabaseAdminRequest } from "@/lib/supabase-admin";

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number | string;
  unit: string;
  description: string;
  image_url: string;
  emoji: string;
  is_active: boolean;
  track_stock: boolean;
  stock_quantity: number | string | null;
  low_stock_threshold: number | string;
  block_out_of_stock: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CatalogProduct = {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  unidad: string;
  descripcion: string;
  imagen: string;
  emoji: string;
  trackStock: boolean;
  stockQuantity: number | null;
  lowStockThreshold: number;
  blockOutOfStock: boolean;
};

export async function getProducts(includeInactive = false) {
  const filter = includeInactive ? "" : "&is_active=eq.true";
  return supabaseAdminRequest<ProductRow[]>(`products?select=*&order=sort_order.asc,name.asc${filter}`);
}

export async function getCatalogProducts() {
  const rows = await getProducts(false);
  return rows.map(toCatalogProduct);
}

export function toCatalogProduct(row: ProductRow): CatalogProduct {
  return {
    id: row.id, nombre: row.name, categoria: row.category, precio: Number(row.price), unidad: row.unit,
    descripcion: row.description, imagen: row.image_url, emoji: row.emoji, trackStock: row.track_stock,
    stockQuantity: row.stock_quantity === null ? null : Number(row.stock_quantity),
    lowStockThreshold: Number(row.low_stock_threshold),
    blockOutOfStock: row.block_out_of_stock,
  };
}
