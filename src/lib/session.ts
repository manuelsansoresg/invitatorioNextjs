import { cookies } from "next/headers";
import { signSession, verifySession } from "@/lib/auth";

const SESSION_COOKIE_NAME = "invitatorio_session";

export async function setSessionCookie(input: {
  userId: string;
  role: "ADMIN" | "CLIENT";
}) {
  const token = signSession(input);
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}
