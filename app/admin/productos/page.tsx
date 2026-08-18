import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { getProducts } from "@/lib/products";
import { getInventoryMovements } from "@/lib/inventory";
import ProductsAdmin from "./ProductsAdmin";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) redirect("/admin/login?next=%2Fadmin%2Fproductos");
  const [products, movements] = await Promise.all([getProducts(true), getInventoryMovements()]);
  return <ProductsAdmin initialProducts={products} initialMovements={movements} />;
}
