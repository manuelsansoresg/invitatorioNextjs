import Link from "next/link";

export const runtime = "nodejs";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reason?: string }>;
}) {
  const { error, reason } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-purple">
        Entrar
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Accede para administrar tus invitaciones.
      </p>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error === "server"
            ? `Error del servidor (${reason || "sin_detalle"}).`
            : "Email o contraseña incorrectos."}
        </div>
      ) : null}

      <form
        action="/api/login"
        method="post"
        className="mt-8 space-y-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
      >
        <label className="block text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            name="email"
            className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
            placeholder="tu@email.com"
            required
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Contraseña
          <input
            type="password"
            name="password"
            className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
            placeholder="••••••••"
            required
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-orange px-6 text-sm font-semibold text-white shadow-sm hover:bg-brand-orange/90"
        >
          Entrar
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-600">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-brand-purple">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
