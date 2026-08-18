import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { getCatalogProducts } from "@/lib/products";
import PosTerminal from "./PosTerminal";

export const dynamic = "force-dynamic";

type PosPageProps = { searchParams: Promise<{ producto?: string }> };

export default async function PosPage({ searchParams }: PosPageProps) {
  const { producto } = await searchParams;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) {
    const destination = producto ? `/admin/pos?producto=${encodeURIComponent(producto)}` : "/admin/pos";
    redirect(`/admin/login?next=${encodeURIComponent(destination)}`);
  }

  return <PosTerminal products={await getCatalogProducts()} initialProductId={producto} />;
}
