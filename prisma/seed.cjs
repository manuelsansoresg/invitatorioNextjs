const crypto = require("node:crypto");

const fs = require("node:fs");
const path = require("node:path");

const { PrismaClient } = require("@prisma/client");

function loadEnvFromDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  const lines = raw.split(/\r\n|\n|\r/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 210000;
  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
  return `pbkdf2_sha256$${iterations}$${salt}$${derivedKey.toString("hex")}`;
}

async function main() {
  loadEnvFromDotEnv();

  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;

  if (!email) throw new Error("USER_EMAIL no está definido en .env");
  if (!password) throw new Error("USER_PASSWORD no está definido en .env");

  const prisma = new PrismaClient();

  await prisma.template.upsert({
    where: { slug: "boda" },
    create: {
      name: "Boda",
      slug: "boda",
      thumbnail: null,
      baseConfig: { type: "boda" },
    },
    update: { name: "Boda" },
  });

  await prisma.template.upsert({
    where: { slug: "xv" },
    create: {
      name: "XV",
      slug: "xv",
      thumbnail: null,
      baseConfig: { type: "xv" },
    },
    update: { name: "XV" },
  });

  await prisma.template.upsert({
    where: { slug: "kids" },
    create: {
      name: "Kids",
      slug: "kids",
      thumbnail: null,
      baseConfig: { type: "kids" },
    },
    update: { name: "Kids" },
  });

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password: hashPassword(password),
      role: "ADMIN",
    },
    update: {
      role: "ADMIN",
      password: hashPassword(password),
    },
  });

  await prisma.$disconnect();
  console.log(`Admin listo: ${email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
