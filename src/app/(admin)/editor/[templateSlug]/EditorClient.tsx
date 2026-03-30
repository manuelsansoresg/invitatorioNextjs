"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WeddingTemplate, type WeddingContent } from "@/components/templates/WeddingTemplate";
import { saveDraftInvitation } from "./actions";

type EditorClientProps = {
  template: { id: string; slug: string; name: string };
  initialInvitation?: { id: string; slug: string } | null;
  initialWedding?: WeddingContent | null;
};

export function EditorClient({ template, initialInvitation = null, initialWedding = null }: EditorClientProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [invitationId, setInvitationId] = useState<string | null>(() => initialInvitation?.id ?? null);
  const [publicSlug, setPublicSlug] = useState<string | null>(() => initialInvitation?.slug ?? null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadChainRef = useRef<Promise<void>>(Promise.resolve());

  const [wedding, setWedding] = useState<WeddingContent>(() => {
    if (template.slug === "boda" && initialWedding) return initialWedding;
    const in30Days = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    const iso = new Date(in30Days.setHours(19, 0, 0, 0)).toISOString();
    return {
      type: "boda",
      heroImageUrl:
        "https://images.unsplash.com/photo-1523438097201-512ae7d59e2c?auto=format&fit=crop&w=1400&q=60",
      brideName: "Wendy",
      groomName: "Omar",
      subtitle: "Nos casamos",
      dateText: "Sábado 12 de Julio · 7:00 PM",
      storyTitle: "Nuestra historia",
      storyText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus non justo sed augue egestas volutpat. Sed vitae risus at sem sollicitudin pretium.",
      brideStoryTitle: "Wendy",
      brideStoryText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque posuere ipsum vel.",
      groomStoryTitle: "Omar",
      groomStoryText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer varius quam in.",
      avatarUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=60",
      gallery: [
        "https://images.unsplash.com/photo-1523437237164-d442d57cc3c9?auto=format&fit=crop&w=1200&q=60",
        "https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?auto=format&fit=crop&w=1200&q=60",
        "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?auto=format&fit=crop&w=1200&q=60",
        "https://images.unsplash.com/photo-1520857014576-2c4f4c972b57?auto=format&fit=crop&w=1200&q=60",
      ],
      quote:
        "Andábamos sin buscarnos, pero sabiendo que andábamos para encontrarnos.",
      countdownIso: iso,
      ceremony: {
        title: "Ceremonia",
        place: "Iglesia Central",
        address: "Av. Principal 123, Centro",
        time: "7:00 PM",
      },
      reception: {
        title: "Recepción",
        place: "Salón Magnolia",
        address: "Calle Jardín 456, Centro",
        time: "9:00 PM",
      },
      giftsTitle: "Mesa de regalos",
      gifts: [
        { imageUrl: "", linkUrl: "" },
        { imageUrl: "", linkUrl: "" },
        { imageUrl: "", linkUrl: "" },
      ],
      mapEmbedUrl:
        "https://www.google.com/maps?q=Monterrey%2C%20NL&output=embed",
    };
  });

  const content = useMemo(() => {
    if (template.slug === "boda") return wedding;
    return { type: template.slug };
  }, [template.slug, wedding]);

  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error || "upload_failed");
    }
    return data.url;
  };

  const enqueueUpload = (fn: () => Promise<void>) => {
    setUploadError(null);
    uploadChainRef.current = uploadChainRef.current
      .then(async () => {
        await fn();
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error && err.message ? err.message : typeof err === "string" ? err : "upload_failed";
        setUploadError(message);
      });
  };

  const onHeroFile = (file: File) => {
    enqueueUpload(async () => {
      const url = await uploadImage(file);
      setWedding((s) => ({ ...s, heroImageUrl: url }));
    });
  };

  const onAvatarFile = (file: File) => {
    enqueueUpload(async () => {
      const url = await uploadImage(file);
      setWedding((s) => ({ ...s, avatarUrl: url }));
    });
  };

  const onGalleryFile = (index: number | null, file: File) => {
    enqueueUpload(async () => {
      const url = await uploadImage(file);
      setWedding((s) => {
        const next = [...(s.gallery || [])].filter(Boolean).slice(0, 4);
        if (index === null) {
          if (next.length >= 4) return s;
          return { ...s, gallery: [...next, url] };
        }
        if (index < 0 || index > 3) return s;
        if (index >= next.length) {
          const padded = [...next];
          while (padded.length < index) padded.push("");
          padded.push(url);
          return { ...s, gallery: padded.filter(Boolean).slice(0, 4) };
        }
        next[index] = url;
        return { ...s, gallery: next.filter(Boolean).slice(0, 4) };
      });
    });
  };

  const onGalleryRemove = (index: number) => {
    setWedding((s) => {
      const next = [...(s.gallery || [])].filter(Boolean).slice(0, 4);
      if (index < 0 || index >= next.length) return s;
      next.splice(index, 1);
      return { ...s, gallery: next };
    });
  };

  const onGiftFile = (index: number, file: File) => {
    enqueueUpload(async () => {
      const url = await uploadImage(file);
      setWedding((s) => {
        const current = Array.isArray(s.gifts) ? s.gifts : [];
        const normalized = current.slice(0, 3).map((g) =>
          typeof g === "string" ? { imageUrl: g, linkUrl: "" } : { imageUrl: g.imageUrl || "", linkUrl: g.linkUrl || "" },
        );
        while (normalized.length < 3) normalized.push({ imageUrl: "", linkUrl: "" });
        if (index < 0 || index > 2) return s;
        const next = [...normalized];
        next[index] = { ...next[index], imageUrl: url };
        return { ...s, gifts: next };
      });
    });
  };

  const onGiftRemove = (index: number) => {
    setWedding((s) => {
      const current = Array.isArray(s.gifts) ? s.gifts : [];
      const normalized = current.slice(0, 3).map((g) =>
        typeof g === "string" ? { imageUrl: g, linkUrl: "" } : { imageUrl: g.imageUrl || "", linkUrl: g.linkUrl || "" },
      );
      while (normalized.length < 3) normalized.push({ imageUrl: "", linkUrl: "" });
      if (index < 0 || index > 2) return s;
      const next = [...normalized];
      next[index] = { imageUrl: "", linkUrl: "" };
      return { ...s, gifts: next };
    });
  };

  const onSave = () => {
    startTransition(async () => {
      const res = await saveDraftInvitation({
        templateId: template.id,
        invitationId: invitationId ?? undefined,
        content,
      });
      setInvitationId(res.id);
      setPublicSlug(res.slug);
      router.replace(`/editor/${template.slug}?invitationId=${res.id}`);
    });
  };

  const panelBody =
    template.slug !== "boda" ? (
      <div className="mt-6 rounded-2xl bg-surface p-6 text-sm text-zinc-600">
        Editor pendiente para esta plantilla.
      </div>
    ) : (
      <div className="mt-6 space-y-6">
        {uploadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Error al subir imagen: {uploadError}
          </div>
        ) : null}
        <div className="rounded-3xl border border-black/5 bg-surface p-5">
          <p className="text-sm font-semibold text-brand-purple">Portada</p>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-zinc-700">
                Novia
                <input
                  value={wedding.brideName}
                  onChange={(e) => setWedding((s) => ({ ...s, brideName: e.target.value }))}
                  className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700">
                Novio
                <input
                  value={wedding.groomName}
                  onChange={(e) => setWedding((s) => ({ ...s, groomName: e.target.value }))}
                  className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-zinc-700">
                Subtítulo
                <input
                  value={wedding.subtitle}
                  onChange={(e) => setWedding((s) => ({ ...s, subtitle: e.target.value }))}
                  className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700">
                Fecha
                <input
                  value={wedding.dateText}
                  onChange={(e) => setWedding((s) => ({ ...s, dateText: e.target.value }))}
                  className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                />
              </label>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Las imágenes se editan directamente en la vista (click o arrastrar).
          </p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-surface p-5">
          <p className="text-sm font-semibold text-brand-purple">Mesa de regalos</p>
          <p className="mt-2 text-xs text-zinc-500">Sube el logo dando click sobre la imagen y agrega el link.</p>
          <div className="mt-4 grid gap-4">
            {Array.from({ length: 3 }).map((_, idx) => {
              const raw = wedding.gifts?.[idx];
              const gift =
                typeof raw === "string"
                  ? { imageUrl: raw, linkUrl: "" }
                  : raw
                    ? { imageUrl: raw.imageUrl || "", linkUrl: raw.linkUrl || "" }
                    : { imageUrl: "", linkUrl: "" };

              return (
                <div key={`gift-${idx}`} className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-900">Elemento {idx + 1}</p>
                    <button
                      type="button"
                      onClick={() => onGiftRemove(idx)}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-xs font-semibold text-zinc-700 hover:border-brand-purple/30 hover:text-brand-purple"
                    >
                      Eliminar
                    </button>
                  </div>
                  <label className="mt-4 block text-sm font-medium text-zinc-700">
                    Link
                    <input
                      value={gift.linkUrl}
                      onChange={(e) =>
                        setWedding((s) => {
                          const current = Array.isArray(s.gifts) ? s.gifts : [];
                          const normalized = current.slice(0, 3).map((g) =>
                            typeof g === "string"
                              ? { imageUrl: g, linkUrl: "" }
                              : { imageUrl: g.imageUrl || "", linkUrl: g.linkUrl || "" },
                          );
                          while (normalized.length < 3) normalized.push({ imageUrl: "", linkUrl: "" });
                          const next = [...normalized];
                          next[idx] = { ...next[idx], linkUrl: e.target.value };
                          return { ...s, gifts: next };
                        })
                      }
                      className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-surface p-5">
          <p className="text-sm font-semibold text-brand-purple">Historia</p>
          <div className="mt-4 grid gap-4">
            <label className="block text-sm font-medium text-zinc-700">
              Título
              <input
                value={wedding.storyTitle}
                onChange={(e) => setWedding((s) => ({ ...s, storyTitle: e.target.value }))}
                className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Texto
              <textarea
                value={wedding.storyText}
                onChange={(e) => setWedding((s) => ({ ...s, storyText: e.target.value }))}
                className="mt-2 block min-h-28 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-brand-purple/40"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-zinc-700">
                Título novia
                <input
                  value={wedding.brideStoryTitle}
                  onChange={(e) => setWedding((s) => ({ ...s, brideStoryTitle: e.target.value }))}
                  className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700">
                Título novio
                <input
                  value={wedding.groomStoryTitle}
                  onChange={(e) => setWedding((s) => ({ ...s, groomStoryTitle: e.target.value }))}
                  className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-zinc-700">
                Texto novia
                <textarea
                  value={wedding.brideStoryText}
                  onChange={(e) => setWedding((s) => ({ ...s, brideStoryText: e.target.value }))}
                  className="mt-2 block min-h-24 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-brand-purple/40"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700">
                Texto novio
                <textarea
                  value={wedding.groomStoryText}
                  onChange={(e) => setWedding((s) => ({ ...s, groomStoryText: e.target.value }))}
                  className="mt-2 block min-h-24 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-brand-purple/40"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-surface p-5">
          <p className="text-sm font-semibold text-brand-purple">Cita</p>
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-700">
              Texto
              <textarea
                value={wedding.quote}
                onChange={(e) => setWedding((s) => ({ ...s, quote: e.target.value }))}
                className="mt-2 block min-h-24 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-brand-purple/40"
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-surface p-5">
          <p className="text-sm font-semibold text-brand-purple">Cuenta regresiva</p>
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-700">
              Fecha y hora (ISO)
              <input
                value={wedding.countdownIso}
                onChange={(e) => setWedding((s) => ({ ...s, countdownIso: e.target.value }))}
                className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-surface p-5">
          <p className="text-sm font-semibold text-brand-purple">Eventos</p>
          <div className="mt-4 grid gap-6">
            <div className="rounded-3xl border border-black/5 bg-white p-5">
              <p className="text-sm font-semibold text-zinc-900">Ceremonia</p>
              <div className="mt-4 grid gap-4">
                <label className="block text-sm font-medium text-zinc-700">
                  Título
                  <input
                    value={wedding.ceremony.title}
                    onChange={(e) =>
                      setWedding((s) => ({
                        ...s,
                        ceremony: { ...s.ceremony, title: e.target.value },
                      }))
                    }
                    className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-700">
                  Lugar
                  <input
                    value={wedding.ceremony.place}
                    onChange={(e) =>
                      setWedding((s) => ({
                        ...s,
                        ceremony: { ...s.ceremony, place: e.target.value },
                      }))
                    }
                    className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-700">
                  Dirección
                  <input
                    value={wedding.ceremony.address}
                    onChange={(e) =>
                      setWedding((s) => ({
                        ...s,
                        ceremony: { ...s.ceremony, address: e.target.value },
                      }))
                    }
                    className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-700">
                  Hora
                  <input
                    value={wedding.ceremony.time}
                    onChange={(e) =>
                      setWedding((s) => ({
                        ...s,
                        ceremony: { ...s.ceremony, time: e.target.value },
                      }))
                    }
                    className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-5">
              <p className="text-sm font-semibold text-zinc-900">Recepción</p>
              <div className="mt-4 grid gap-4">
                <label className="block text-sm font-medium text-zinc-700">
                  Título
                  <input
                    value={wedding.reception.title}
                    onChange={(e) =>
                      setWedding((s) => ({
                        ...s,
                        reception: { ...s.reception, title: e.target.value },
                      }))
                    }
                    className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-700">
                  Lugar
                  <input
                    value={wedding.reception.place}
                    onChange={(e) =>
                      setWedding((s) => ({
                        ...s,
                        reception: { ...s.reception, place: e.target.value },
                      }))
                    }
                    className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-700">
                  Dirección
                  <input
                    value={wedding.reception.address}
                    onChange={(e) =>
                      setWedding((s) => ({
                        ...s,
                        reception: { ...s.reception, address: e.target.value },
                      }))
                    }
                    className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-700">
                  Hora
                  <input
                    value={wedding.reception.time}
                    onChange={(e) =>
                      setWedding((s) => ({
                        ...s,
                        reception: { ...s.reception, time: e.target.value },
                      }))
                    }
                    className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-surface p-5">
          <p className="text-sm font-semibold text-brand-purple">Mapa</p>
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-700">
              URL embed (iframe)
              <input
                value={wedding.mapEmbedUrl}
                onChange={(e) => setWedding((s) => ({ ...s, mapEmbedUrl: e.target.value }))}
                className="mt-2 block h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-zinc-900 outline-none focus:border-brand-purple/40"
              />
            </label>
          </div>
        </div>
      </div>
    );

  return (
    <div className="relative w-full">
      {panelOpen ? (
        <button
          type="button"
          aria-label="Cerrar panel"
          onClick={() => setPanelOpen(false)}
          className="fixed inset-0 z-40 bg-black/25 lg:hidden"
        />
      ) : null}

      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex h-12 items-center justify-center rounded-full bg-brand-orange px-6 text-sm font-semibold text-white shadow-lg hover:bg-brand-orange/90 lg:hidden"
      >
        Personalizar
      </button>

      <div className="lg:flex lg:items-start lg:gap-0">
        <main className="min-w-0 flex-1 bg-white">
          {template.slug === "boda" ? (
            <WeddingTemplate
              content={wedding}
              editable
              onHeroFile={onHeroFile}
              onAvatarFile={onAvatarFile}
              onGalleryFile={onGalleryFile}
              onGalleryRemove={onGalleryRemove}
              onGiftFile={onGiftFile}
              onGiftRemove={onGiftRemove}
            />
          ) : (
            <div className="p-8 text-sm text-zinc-600">Preview pendiente para esta plantilla.</div>
          )}
        </main>

        <aside
          className={[
            "bg-white shadow-sm",
            "fixed inset-y-0 right-0 z-50 w-[380px] max-w-[90vw] overflow-y-auto border-l border-black/10 p-6",
            "transition-transform duration-200",
            panelOpen ? "translate-x-0" : "translate-x-full",
            "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 lg:border-l lg:border-black/10",
            panelCollapsed ? "lg:w-[72px] lg:p-2" : "lg:w-[420px]",
          ].join(" ")}
        >
          <button
            type="button"
            aria-label={panelCollapsed ? "Expandir panel" : "Colapsar panel"}
            onClick={() => setPanelCollapsed((p) => !p)}
            className="absolute -left-8 top-1/2 hidden h-24 w-8 -translate-y-1/2 items-center justify-center rounded-l-2xl border border-black/10 bg-white text-sm font-semibold text-zinc-700 shadow-sm hover:text-brand-purple lg:flex"
          >
            {panelCollapsed ? "‹" : "›"}
          </button>

          {panelCollapsed ? (
            <div className="hidden h-full lg:flex lg:flex-col lg:items-center lg:justify-between">
              <Link
                href="/templates"
                aria-label="Volver"
                className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-semibold text-zinc-700 hover:border-brand-purple/30 hover:text-brand-purple"
              >
                ←
              </Link>
              <button
                type="button"
                onClick={onSave}
                disabled={isPending}
                className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple text-sm font-semibold text-white hover:bg-brand-purple/90 disabled:opacity-60"
              >
                S
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Personalizar página</h2>
                  <p className="mt-1 text-xs text-zinc-500">Edita textos por sección</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/templates"
                    className="hidden h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-zinc-700 hover:border-brand-purple/30 hover:text-brand-purple lg:inline-flex"
                  >
                    Volver
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-zinc-700 hover:border-brand-purple/30 hover:text-brand-purple lg:hidden"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={isPending}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-brand-orange px-4 text-sm font-semibold text-white hover:bg-brand-orange/90 disabled:opacity-60"
                  >
                    {invitationId ? "Guardar" : "Guardar borrador"}
                  </button>
                </div>
              </div>

              {publicSlug ? (
                <div className="mt-5 rounded-2xl border border-black/5 bg-surface px-4 py-3 text-sm text-zinc-700">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      URL pública:{" "}
                      <span className="font-semibold text-brand-purple">/{publicSlug}</span>
                    </span>
                    <Link href={`/${publicSlug}`} className="font-semibold text-brand-purple" target="_blank">
                      Abrir
                    </Link>
                  </div>
                </div>
              ) : null}

              {panelBody}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
