import Link from "next/link";

export default function BodasPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-purple">
        Bodas
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Selecciona un template y crea una invitación.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-brand-purple">Template</p>
          <p className="mt-2 font-serif text-3xl text-zinc-900">Boda clásica</p>
          <p className="mt-3 text-sm text-zinc-600">
            Diseñado para parejas, con historia, RSVP y mapa.
          </p>
          <Link
            href="/editor"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-brand-orange px-4 text-sm font-semibold text-white hover:bg-brand-orange/90"
          >
            Usar este template
          </Link>
        </div>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-brand-purple">Próximamente</p>
          <p className="mt-2 font-serif text-3xl text-zinc-900">Boda moderna</p>
          <p className="mt-3 text-sm text-zinc-600">
            Variantes de layout, galería y mesa de regalos.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-zinc-700"
          >
            No disponible
          </button>
        </div>
      </div>
    </div>
  );
}
