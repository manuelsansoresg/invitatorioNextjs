"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

function normalizeServerReason(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  if (message.includes("AUTH_SECRET")) return "env_auth_secret";
  if (message.includes("DATABASE_URL")) return "env_database_url";
  if (message.includes("P1000")) return "db_auth";
  if (message.includes("Can't reach database server")) return "db_unreachable";
  if (message.includes("Environment variable not found")) return "env_missing";
  return "server_error";
}

export async function login(formData: FormData) {
  if (!process.env.AUTH_SECRET) redirect("/login?error=server&reason=env_auth_secret");
  if (!process.env.DATABASE_URL) redirect("/login?error=server&reason=env_database_url");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) redirect("/login?error=1");

  let user: { id: string; password: string; role: "ADMIN" | "CLIENT" } | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, role: true },
    });
  } catch (err) {
    redirect(`/login?error=server&reason=${normalizeServerReason(err)}`);
  }
  if (!user) redirect("/login?error=1");

  const ok = verifyPassword(password, user.password);
  if (!ok) redirect("/login?error=1");

  try {
    await setSessionCookie({ userId: user.id, role: user.role });
  } catch (err) {
    redirect(`/login?error=server&reason=${normalizeServerReason(err)}`);
  }
  redirect("/templates");
}
