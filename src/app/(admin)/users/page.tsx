import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export default async function UsersAdminPage() {
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-purple">
        Usuarios
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Panel de administración (CRUD pendiente).
      </p>

      <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-zinc-900">
            Tabla de usuarios
          </span>
          <button className="inline-flex h-10 items-center justify-center rounded-full bg-brand-orange px-4 text-sm font-semibold text-white hover:bg-brand-orange/90">
            Nuevo usuario
          </button>
        </div>
        <div className="mt-6 h-40 rounded-2xl bg-surface" />
      </div>
    </div>
  );
}
