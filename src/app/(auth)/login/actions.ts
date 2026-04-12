"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) redirect("/login?error=1");

  let user: { id: string; password: string; role: "ADMIN" | "CLIENT" } | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, role: true },
    });
  } catch {
    redirect("/login?error=server");
  }
  if (!user) redirect("/login?error=1");

  const ok = verifyPassword(password, user.password);
  if (!ok) redirect("/login?error=1");

  try {
    await setSessionCookie({ userId: user.id, role: user.role });
  } catch {
    redirect("/login?error=server");
  }
  redirect("/templates");
}
