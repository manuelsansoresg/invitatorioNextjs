"use server";

import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function saveDraftInvitation(input: {
  templateId: string;
  invitationId?: string;
  content: Prisma.InputJsonValue;
}) {
  const session = await requireAdmin();

  if (input.invitationId) {
    const updated = await prisma.invitation.update({
      where: { id: input.invitationId },
      data: { content: input.content },
      select: { id: true, slug: true },
    });
    return updated;
  }

  const slug = `inv-${crypto.randomUUID().slice(0, 8)}`;
  const created = await prisma.invitation.create({
    data: {
      userId: session.userId,
      templateId: input.templateId,
      slug,
      status: "DRAFT",
      content: input.content,
    },
    select: { id: true, slug: true },
  });
  return created;
}
