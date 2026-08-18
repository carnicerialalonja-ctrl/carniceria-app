import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { getCashRegisterData } from "@/lib/cash-register";
import CashRegister from "./CashRegister";

export const dynamic = "force-dynamic";

export default async function CashRegisterPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) redirect("/admin/login?next=%2Fadmin%2Fpos%2Fcaja");
  return <CashRegister initialData={await getCashRegisterData()} />;
}
