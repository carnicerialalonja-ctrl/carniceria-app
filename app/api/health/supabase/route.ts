import { supabaseAdminRequest } from "@/lib/supabase-admin";

export async function GET() {
  try {
    await supabaseAdminRequest("orders?select=id&limit=1");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Supabase health check failed.", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
