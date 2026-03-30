import crypto from "node:crypto";

type SessionPayload = {
  userId: string;
  role: "ADMIN" | "CLIENT";
  exp: number;
};

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const [algo, iterRaw, salt, hex] = parts;
  if (algo !== "pbkdf2_sha256") return false;

  const iterations = Number(iterRaw);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const derivedKey = crypto.pbkdf2Sync(plain, salt, iterations, 32, "sha256");
  const a = Buffer.from(hex, "hex");
  if (a.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(a, derivedKey);
}

export function createPasswordHash(plain: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 210000;
  const derivedKey = crypto.pbkdf2Sync(plain, salt, iterations, 32, "sha256");
  return `pbkdf2_sha256$${iterations}$${salt}$${derivedKey.toString("hex")}`;
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no está definido");
  return secret;
}

export function signSession(payload: Omit<SessionPayload, "exp">, ttlSeconds = 60 * 60 * 24 * 7) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const full: SessionPayload = { ...payload, exp };
  const json = JSON.stringify(full);
  const data = Buffer.from(json, "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", getAuthSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function verifySession(token: string): SessionPayload | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = crypto
    .createHmac("sha256", getAuthSecret())
    .update(data)
    .digest("base64url");

  const a = Buffer.from(sig, "base64url");
  const b = Buffer.from(expected, "base64url");
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("userId" in parsed) ||
    !("role" in parsed) ||
    !("exp" in parsed)
  ) {
    return null;
  }

  const p = parsed as SessionPayload;
  if (typeof p.userId !== "string") return null;
  if (p.role !== "ADMIN" && p.role !== "CLIENT") return null;
  if (typeof p.exp !== "number") return null;
  if (Math.floor(Date.now() / 1000) > p.exp) return null;
  return p;
}
