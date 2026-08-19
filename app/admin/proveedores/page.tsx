import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminTokenValid } from "@/lib/admin-auth";
import { supabaseAdminRequest } from "@/lib/supabase-admin";
import styles from "./proveedores.module.css";

export const dynamic = "force-dynamic";

type Supplier = {
  id: string;
  name: string;
  allows_cash: boolean;
  allows_credit: boolean;
};

type Offering = {
  supplier_id: string;
  item_name: string;
};

type SupplierCode = {
  supplier_id: string;
  supplier_code: string;
  supplier_description: string | null;
};

export default async function SuppliersPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdminTokenValid(token)) redirect("/admin/login?next=%2Fadmin%2Fproveedores");

  const [suppliers, offerings, codes] = await Promise.all([
    supabaseAdminRequest<Supplier[]>("suppliers?select=id,name,allows_cash,allows_credit&active=eq.true&order=name.asc"),
    supabaseAdminRequest<Offering[]>("supplier_offerings?select=supplier_id,item_name&active=eq.true&order=item_name.asc"),
    supabaseAdminRequest<SupplierCode[]>("supplier_product_codes?select=supplier_id,supplier_code,supplier_description&active=eq.true&order=supplier_code.asc"),
  ]);

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <span>CATÁLOGO DE COMPRAS</span>
          <h1>Proveedores</h1>
          <p>Qué mercancía compras y las formas de pago aceptadas por cada proveedor.</p>
        </div>
        <nav>
          <a href="/admin/admon">← Admon</a>
          <a href="/admin/pos">Abrir POS</a>
          <a href="/admin/productos">Productos</a>
        </nav>
      </header>

      <section className={styles.summary}>
        <div><strong>{suppliers.length}</strong><span>proveedores activos</span></div>
        <div><strong>{offerings.length}</strong><span>líneas de compra</span></div>
        <div><strong>{codes.length}</strong><span>códigos preparados</span></div>
      </section>

      <section className={styles.grid} aria-label="Proveedores registrados">
        {suppliers.map((supplier) => {
          const supplierOfferings = offerings.filter((item) => item.supplier_id === supplier.id);
          const supplierCodes = codes.filter((item) => item.supplier_id === supplier.id);
          return (
            <article className={styles.card} key={supplier.id}>
              <div className={styles.cardHead}>
                <div className={styles.avatar}>{supplier.name.slice(0, 2).toUpperCase()}</div>
                <div><h2>{supplier.name}</h2><small>{supplier.id}</small></div>
              </div>
              <div className={styles.section}>
                <h3>Le compramos</h3>
                <div className={styles.tags}>{supplierOfferings.map((item) => <span key={item.item_name}>{item.item_name}</span>)}</div>
              </div>
              <div className={styles.section}>
                <h3>Forma de pago</h3>
                <div className={styles.payments}>
                  {supplier.allows_cash && <span>💵 Contado</span>}
                  {supplier.allows_credit && <span>🕐 Crédito</span>}
                </div>
              </div>
              {supplierCodes.length > 0 && <div className={styles.codes}>
                <h3>Códigos reconocidos</h3>
                {supplierCodes.map((code) => <p key={code.supplier_code}><code>{code.supplier_code}</code><span>{code.supplier_description || "Sin descripción"}</span></p>)}
              </div>}
            </article>
          );
        })}
      </section>

      <aside className={styles.note}>
        <strong>Listo para recepción por escáner</strong>
        <p>Ya quedaron registrados PROAN y MaxiCarne con los códigos conocidos. Los siguientes códigos que leas podrán relacionarse con este catálogo.</p>
      </aside>
    </main>
  );
}
