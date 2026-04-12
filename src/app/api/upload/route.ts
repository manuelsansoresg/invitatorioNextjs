import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
import path from "node:path";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function getExtension(fileName: string, mimeType: string) {
  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".heic", ".heif"]);
  const ext = path.extname(fileName || "").toLowerCase();
  if (ext && allowed.has(ext)) return ext === ".jpeg" ? ".jpg" : ext;

  const byMime: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "image/heif": ".heif",
  };
  const fromMime = byMime[(mimeType || "").toLowerCase()];
  if (fromMime && allowed.has(fromMime)) return fromMime === ".jpeg" ? ".jpg" : fromMime;
  return "";
}

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "env_database_url" }, { status: 500 });
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!file || typeof file !== "object") {
      return NextResponse.json({ error: "file_required" }, { status: 400 });
    }

    const candidate = file as unknown as { name?: unknown; type?: unknown; arrayBuffer?: unknown };
    if (typeof candidate.arrayBuffer !== "function") {
      return NextResponse.json({ error: "file_required" }, { status: 400 });
    }

    const originalName = typeof candidate.name === "string" ? candidate.name : "upload";
    const type = typeof candidate.type === "string" ? candidate.type : "application/octet-stream";
    const ext = getExtension(originalName, type);
    if (!ext) {
      return NextResponse.json({ error: "unsupported_file" }, { status: 415 });
    }

    const bytes = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "file_too_large" }, { status: 413 });
    }

    const id = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "files" ("id", "name", "mimeType", "data", "createdAt")
      VALUES (${id}, ${originalName}, ${type}, ${buffer}, NOW())
    `;

    return NextResponse.json({ url: `/api/images/${id}` });
  } catch (error) {
    console.error("Error uploading file:", error);
    const record = typeof error === "object" && error !== null ? (error as Record<string, unknown>) : null;
    const code = typeof record?.code === "string" ? record.code : "";
    if (code === "P2021" || code === "P2022") {
      return NextResponse.json({ error: "db_not_migrated" }, { status: 500 });
    }
    const message = error instanceof Error ? error.message : "";
    if (message.includes('relation "files" does not exist')) {
      return NextResponse.json({ error: "db_not_migrated" }, { status: 500 });
    }
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
