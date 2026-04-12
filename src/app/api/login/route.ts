import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { signSession } from "@/lib/auth";

export const runtime = "nodejs";

function redirectTo(requestUrl: string, path: string) {
  return NextResponse.redirect(new URL(path, requestUrl));
}

function redirectTo303(requestUrl: string, path: string) {
  return NextResponse.redirect(new URL(path, requestUrl), 303);
}

export async function POST(request: Request) {
  if (!process.env.AUTH_SECRET) return redirectTo(request.url, "/login?error=server&reason=env_auth_secret");
  if (!process.env.DATABASE_URL) return redirectTo(request.url, "/login?error=server&reason=env_database_url");

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return redirectTo(request.url, "/login?error=1");

  let user: { id: string; password: string; role: "ADMIN" | "CLIENT" } | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, role: true },
    });
  } catch {
    return redirectTo(request.url, "/login?error=server&reason=db_query");
  }

  if (!user) return redirectTo(request.url, "/login?error=1");

  const ok = verifyPassword(password, user.password);
  if (!ok) return redirectTo(request.url, "/login?error=1");

  const token = signSession({ userId: user.id, role: user.role });
  const res = redirectTo303(request.url, "/templates");
  res.headers.set("cache-control", "no-store");
  res.cookies.set("invitatorio_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
