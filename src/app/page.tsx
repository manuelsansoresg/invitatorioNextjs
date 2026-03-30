import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-purple/10 px-3 py-1 text-sm font-medium text-brand-purple">
              Invitaciones dinámicas
              <span className="h-1 w-1 rounded-full bg-brand-purple" />
              Next.js + MySQL + Prisma
            </div>

            <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Crea invitaciones interactivas para bodas, XV y kids con un editor
              en tiempo real.
            </h1>

            <p className="text-pretty text-lg leading-8 text-zinc-600">
              Diseños vibrantes, personalización por plantilla y publicación con
              un slug único para compartir.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand-orange px-6 text-sm font-semibold text-white shadow-sm hover:bg-brand-orange/90"
              >
                Empezar ahora
              </Link>
              <Link
                href="/editor"
                className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-semibold text-brand-purple hover:border-brand-purple/30"
              >
                Ver editor
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-purple">
                  Preview
                </span>
                <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">
                  Live
                </span>
              </div>
              <div className="rounded-2xl bg-surface p-6">
                <p className="font-serif text-2xl text-zinc-900">
                  Andrea &amp; Luis
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  Sábado 12 de Julio · 7:00 PM
                </p>
                <div className="mt-5 h-2 w-24 rounded-full bg-brand-orange" />
                <p className="mt-6 text-sm leading-6 text-zinc-600">
                  “Con mucha alegría te invitamos a celebrar con nosotros este
                  día tan especial.”
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-10 rounded-xl bg-brand-orange/10" />
                <div className="h-10 rounded-xl bg-brand-purple/10" />
                <div className="h-10 rounded-xl bg-zinc-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
