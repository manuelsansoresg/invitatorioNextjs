"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const hide = pathname.startsWith("/editor") || pathname.startsWith("/inv-");

  return (
    <>
      {hide ? null : (
        <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-semibold tracking-tight text-brand-purple">Invitatorio</span>
              <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-xs font-medium text-brand-orange">
                SaaS
              </span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-700 md:flex">
              <Link href="/" className="hover:text-brand-purple">
                INICIO
              </Link>
              <Link href="/bodas" className="hover:text-brand-purple">
                BODAS
              </Link>
              <Link href="/xvs" className="hover:text-brand-purple">
                XVS
              </Link>
              <Link href="/recuerdatorio" className="hover:text-brand-purple">
                RECUERDATORIO
              </Link>
              <Link href="/kids" className="hover:text-brand-purple">
                KIDS
              </Link>
              <Link href="/a-la-carta" className="hover:text-brand-purple">
                A LA CARTA
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-zinc-700 hover:text-brand-purple sm:inline-flex"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-full bg-brand-orange px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-orange/90"
              >
                Crear invitación
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className={hide ? "min-h-screen" : "flex-1"}>{children}</main>

      {hide ? null : (
        <footer className="border-t border-black/5 bg-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-6 text-sm text-zinc-600">
            <span>© {new Date().getFullYear()} Invitatorio</span>
            <span className="text-brand-purple">Hecho para celebrar</span>
          </div>
        </footer>
      )}
    </>
  );
}

