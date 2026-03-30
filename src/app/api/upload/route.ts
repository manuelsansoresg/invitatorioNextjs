import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getExtension(fileName: string) {
  const ext = path.extname(fileName || "").toLowerCase();
  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".heic", ".heif"]);
  if (!allowed.has(ext)) return "";
  return ext === ".jpeg" ? ".jpg" : ext;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }

  const ext = getExtension(file.name);
  if (!ext) {
    return NextResponse.json({ error: "unsupported_file" }, { status: 415 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const name = `${crypto.randomUUID()}${ext}`;
  await fs.writeFile(path.join(uploadsDir, name), buffer);

  return NextResponse.json({ url: `/uploads/${name}` });
}
