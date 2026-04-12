import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export default async function TemplatesPage() {
  await requireAdmin();

  const templates = await prisma.template.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, slug: true, thumbnail: true },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-purple">
            Plantillas
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Selecciona una plantilla para editar y previsualizar.
          </p>
        </div>
        <Link
          href="/logout"
          className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-zinc-700 hover:border-brand-purple/30 hover:text-brand-purple"
        >
          Salir
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div
            key={t.id}
            className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-brand-purple">Template</p>
              <span className="rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-semibold text-brand-purple">
                {t.slug}
              </span>
            </div>
            <p className="mt-2 font-serif text-3xl text-zinc-900">{t.name}</p>
            <div className="mt-5 h-28 rounded-2xl bg-surface" />
            <Link
              href={`/editor/${t.slug}`}
              className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-full bg-brand-orange px-4 text-sm font-semibold text-white hover:bg-brand-orange/90"
            >
              Editar
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
