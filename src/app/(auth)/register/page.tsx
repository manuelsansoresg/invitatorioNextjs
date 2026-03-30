import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-purple">
        Crear cuenta
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Comienza a crear tu invitación en minutos.
      </p>

      <form className="mt-8 space-y-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            name="email"
            className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
            placeholder="tu@email.com"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Contraseña
          <input
            type="password"
            name="password"
            className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
            placeholder="••••••••"
          />
        </label>
        <button
          type="button"
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-orange px-6 text-sm font-semibold text-white shadow-sm hover:bg-brand-orange/90"
        >
          Continuar
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand-purple">
          Entrar
        </Link>
      </p>
    </div>
  );
}
