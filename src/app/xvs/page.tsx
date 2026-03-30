import Link from "next/link";

export default function XvsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-purple">
        XVS
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Templates para XV años (Kids y XV separados).
      </p>

      <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-brand-purple">Template</p>
        <p className="mt-2 font-serif text-3xl text-zinc-900">XV vibrante</p>
        <p className="mt-3 text-sm text-zinc-600">
          Ideal para celebrantes, con dress code y ubicación.
        </p>
        <Link
          href="/editor"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-brand-orange px-4 text-sm font-semibold text-white hover:bg-brand-orange/90"
        >
          Usar este template
        </Link>
      </div>
    </div>
  );
}
