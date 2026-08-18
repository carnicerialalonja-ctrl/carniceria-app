import { getCatalogProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getCatalogProducts(), { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } });
  } catch (error) {
    console.error("No fue posible cargar el catálogo público.", error);
    return Response.json({ error: "No fue posible cargar los productos." }, { status: 500 });
  }
}
