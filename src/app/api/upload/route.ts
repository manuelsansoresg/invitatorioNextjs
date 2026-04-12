import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "node:path";

export const runtime = "nodejs";

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

    const dbFile = await (prisma as any).file.create({
      data: {
        name: originalName,
        mimeType: type,
        data: buffer,
      },
    });

    return NextResponse.json({ url: `/api/images/${dbFile.id}` });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
