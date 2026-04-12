import { redirect } from "next/navigation";
import { getSessionState } from "@/lib/session";

export async function requireAdmin() {
  const { state, session } = await getSessionState();
  if (state === "missing") redirect("/login?error=server&reason=session_missing");
  if (state === "invalid") redirect("/login?error=server&reason=session_invalid");
  if (session.role !== "ADMIN") redirect("/login?error=server&reason=not_admin");
  return session;
}
