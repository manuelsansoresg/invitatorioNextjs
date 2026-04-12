import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { WeddingContent } from "@/components/templates/WeddingTemplate";
import { EditorClient } from "./EditorClient";

export const runtime = "nodejs";

export default async function TemplateEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateSlug: string }>;
  searchParams: Promise<{ invitationId?: string }>;
}) {
  await requireAdmin();
  const { templateSlug } = await params;
  const { invitationId } = await searchParams;

  const template = await prisma.template.findUnique({
    where: { slug: templateSlug },
    select: { id: true, slug: true, name: true },
  });

  if (!template) notFound();

  const existing = invitationId
    ? await prisma.invitation.findFirst({
        where: { id: invitationId, templateId: template.id },
        select: { id: true, slug: true, content: true },
      })
    : null;

  const initialWedding =
    template.slug === "boda" &&
    existing?.content &&
    typeof existing.content === "object" &&
    (existing.content as { type?: unknown }).type === "boda"
      ? (existing.content as unknown as WeddingContent)
      : null;

  return (
    <EditorClient
      template={template}
      initialInvitation={existing ? { id: existing.id, slug: existing.slug } : null}
      initialWedding={initialWedding}
    />
  );
}
