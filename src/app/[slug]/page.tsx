import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WeddingTemplate, type WeddingContent } from "@/components/templates/WeddingTemplate";
import { XVTemplate } from "@/components/templates/XVTemplate";

export const runtime = "nodejs";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === "string" ? v : "")).filter(Boolean);
}

export default async function InvitationPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    select: {
      slug: true,
      content: true,
      template: { select: { slug: true, name: true } },
    },
  });

  if (!invitation) notFound();
  const content = invitation.content as unknown as Record<string, unknown>;

  if (invitation.template.slug === "boda") {
    return (
      <WeddingTemplate
        content={
          {
            type: "boda",
            heroImageUrl: asString(content.heroImageUrl),
            brideName: asString(content.brideName),
            groomName: asString(content.groomName),
            subtitle: asString(content.subtitle) || "Nos casamos",
            dateText: asString(content.dateText),
            storyTitle: asString(content.storyTitle) || "Nuestra historia",
            storyText: asString(content.storyText),
            brideStoryTitle: asString(content.brideStoryTitle),
            brideStoryText: asString(content.brideStoryText),
            groomStoryTitle: asString(content.groomStoryTitle),
            groomStoryText: asString(content.groomStoryText),
            avatarUrl: asString(content.avatarUrl),
            gallery: asStringArray(content.gallery),
            quote: asString(content.quote),
            countdownIso: asString(content.countdownIso) || new Date().toISOString(),
            ceremony: {
              title: asString(asRecord(content.ceremony).title) || "Ceremonia",
              place: asString(asRecord(content.ceremony).place),
              address: asString(asRecord(content.ceremony).address),
              time: asString(asRecord(content.ceremony).time),
            },
            reception: {
              title: asString(asRecord(content.reception).title) || "Recepción",
              place: asString(asRecord(content.reception).place),
              address: asString(asRecord(content.reception).address),
              time: asString(asRecord(content.reception).time),
            },
            giftsTitle: asString(content.giftsTitle) || "Mesa de regalos",
            gifts: asStringArray(content.gifts),
            mapEmbedUrl: asString(content.mapEmbedUrl),
          } satisfies WeddingContent
        }
      />
    );
  }

  if (invitation.template.slug === "xv") {
    return <XVTemplate celebrantName={asString(content.celebrantName)} dateText={asString(content.dateText)} />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-brand-purple">{invitation.template.name}</p>
        <p className="mt-2 text-sm text-zinc-600">Render pendiente para esta plantilla.</p>
      </div>
    </div>
  );
}
