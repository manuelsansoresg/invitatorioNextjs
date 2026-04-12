import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // the model is `file` but the IDE linter might be complaining.
    // Let's use Prisma generic query or ignore the error.
    const file = await (prisma as any).file.findUnique({
      where: { id },
    });

    if (!file) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", file.mimeType);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(file.data, { headers });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}