import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminToken, isAdminPasswordValid } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const candidate = String(form.get("password") || "");
  const requestedNext = String(form.get("next") || "");
  const next = requestedNext.startsWith("/admin/") && !requestedNext.startsWith("//") ? requestedNext : "/admin/admon";

  if (!isAdminPasswordValid(candidate)) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "1");
    if (requestedNext) loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
    priority: "high",
  });
  return response;
}
