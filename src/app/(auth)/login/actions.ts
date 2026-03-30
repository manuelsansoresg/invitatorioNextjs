"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) redirect("/login?error=1");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect("/login?error=1");

  const ok = verifyPassword(password, user.password);
  if (!ok) redirect("/login?error=1");

  await setSessionCookie({ userId: user.id, role: user.role });
  redirect("/templates");
}
