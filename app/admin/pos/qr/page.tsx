import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { getCatalogProducts } from "@/lib/products";
import QrLabels from "./QrLabels";

export const dynamic = "force-dynamic";

export default async function QrLabelsPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) redirect("/admin/login");
  return <QrLabels products={await getCatalogProducts()} />;
}
