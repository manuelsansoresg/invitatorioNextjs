import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const rows = await prisma.$queryRaw<Array<{ mimeType: string; data: Buffer }>>`
      SELECT "mimeType", "data"
      FROM "files"
      WHERE "id" = ${id}
      LIMIT 1
    `;
    const file = rows[0] ?? null;

    if (!file?.data) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", file.mimeType);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    const bytes = new Uint8Array(file.data);
    return new NextResponse(bytes, { headers });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
