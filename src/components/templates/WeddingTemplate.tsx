"use client";

import Image from "next/image";
import type { DragEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type WeddingContent = {
  type: "boda";
  heroImageUrl: string;
  brideName: string;
  groomName: string;
  subtitle: string;
  dateText: string;
  storyTitle: string;
  storyText: string;
  brideStoryTitle: string;
  brideStoryText: string;
  groomStoryTitle: string;
  groomStoryText: string;
  avatarUrl: string;
  gallery: string[];
  quote: string;
  countdownIso: string;
  ceremony: { title: string; place: string; address: string; time: string };
  reception: { title: string; place: string; address: string; time: string };
  giftsTitle: string;
  gifts: Array<string | { imageUrl: string; linkUrl: string }>;
  mapEmbedUrl: string;
};

function clampInt(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function Countdown({ iso }: { iso: string }) {
  const target = useMemo(() => new Date(iso).getTime(), [iso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const totalSeconds = clampInt(diff / 1000);
  const days = clampInt(totalSeconds / 86400);
  const hours = clampInt((totalSeconds % 86400) / 3600);
  const minutes = clampInt((totalSeconds % 3600) / 60);
  const seconds = clampInt(totalSeconds % 60);

  const box = "flex h-28 w-28 flex-col items-center justify-center bg-[#f1ece4]";
  const num = "font-serif text-6xl leading-none text-zinc-900";
  const lab = "mt-1 font-serif text-xl leading-none text-zinc-900";

  return (
    <div className="flex flex-wrap justify-center gap-8">
      <div className={box}>
        <span className={num}>{days}</span>
        <span className={lab}>Días</span>
      </div>
      <div className={box}>
        <span className={num}>{hours}</span>
        <span className={lab}>Horas</span>
      </div>
      <div className={box}>
        <span className={num}>{minutes}</span>
        <span className={lab}>Minutos</span>
      </div>
      <div className={box}>
        <span className={num}>{seconds}</span>
        <span className={lab}>Segundos</span>
      </div>
    </div>
  );
}

function getFilesFromDrop(e: DragEvent) {
  return Array.from(e.dataTransfer.files || []);
}

type WeddingTemplateProps = {
  content: WeddingContent;
  editable?: boolean;
  uploading?: boolean;
  uploadError?: string | null;
  onHeroFile?: (file: File) => void;
  onAvatarFile?: (file: File) => void;
  onGalleryFile?: (index: number | null, file: File) => void;
  onGalleryRemove?: (index: number) => void;
  onGiftFile?: (index: number, file: File) => void;
  onGiftRemove?: (index: number) => void;
};

export function WeddingTemplate({
  content,
  editable = false,
  uploading = false,
  uploadError = null,
  onHeroFile,
  onAvatarFile,
  onGalleryFile,
  onGalleryRemove,
  onGiftFile,
  onGiftRemove,
}: WeddingTemplateProps) {
  const names = `${content.brideName} & ${content.groomName}`;
  const gallery = [...content.gallery].slice(0, 4).filter(Boolean);
  const hero = content.heroImageUrl || "";
  const [active, setActive] = useState(0);
  const activeIndex = gallery.length ? Math.min(active, gallery.length - 1) : 0;
  const [pickNotice, setPickNotice] = useState<string | null>(null);
  const pickNoticeTimerRef = useRef<number | null>(null);

  const fileInputClassName = "absolute -left-[9999px] h-px w-px opacity-0";
  const heroInputId = "hero-image-picker";
  const avatarInputId = "avatar-image-picker";
  const galleryAddInputId = "gallery-add-image-picker";

  useEffect(() => {
    return () => {
      if (pickNoticeTimerRef.current !== null) {
        window.clearTimeout(pickNoticeTimerRef.current);
        pickNoticeTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gallery.length < 2) return;
    const id = setInterval(() => {
      setActive((p) => (p + 1) % gallery.length);
    }, 3500);
    return () => clearInterval(id);
  }, [gallery.length]);

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const galleryAddInputRef = useRef<HTMLInputElement | null>(null);
  const galleryReplaceInputRef = useRef<HTMLInputElement | null>(null);
  const [galleryReplaceIndex, setGalleryReplaceIndex] = useState<number | null>(null);
  const giftReplaceInputRef = useRef<HTMLInputElement | null>(null);
  const [giftReplaceIndex, setGiftReplaceIndex] = useState<number | null>(null);
  const openGiftPicker = (index: number) => {
    setGiftReplaceIndex(index);
    giftReplaceInputRef.current?.click();
  };

  const showPickNotice = (message: string) => {
    setPickNotice(message);
    if (pickNoticeTimerRef.current !== null) window.clearTimeout(pickNoticeTimerRef.current);
    pickNoticeTimerRef.current = window.setTimeout(() => {
      setPickNotice(null);
      pickNoticeTimerRef.current = null;
    }, 2500);
  };

  return (
    <article className="w-full bg-white">
      {editable && (uploading || uploadError || pickNotice) ? (
        <div className="pointer-events-none fixed left-4 top-4 z-[60] w-[min(520px,calc(100vw-2rem))]">
          <div
            className={[
              "rounded-2xl border px-4 py-3 text-sm shadow-sm backdrop-blur",
              uploadError ? "border-red-200 bg-red-50/95 text-red-700" : "border-black/10 bg-white/90 text-zinc-800",
            ].join(" ")}
          >
            {uploadError ? `Error al subir imagen: ${uploadError}` : uploading ? "Subiendo imagen…" : pickNotice}
          </div>
        </div>
      ) : null}
      <input
        ref={heroInputRef}
        id={heroInputId}
        type="file"
        accept="image/*"
        className={fileInputClassName}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) {
            showPickNotice("No se seleccionó archivo");
            return;
          }
          showPickNotice(`Seleccionado: ${file.name || "imagen"}`);
          onHeroFile?.(file);
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={avatarInputRef}
        id={avatarInputId}
        type="file"
        accept="image/*"
        className={fileInputClassName}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) {
            showPickNotice("No se seleccionó archivo");
            return;
          }
          showPickNotice(`Seleccionado: ${file.name || "imagen"}`);
          onAvatarFile?.(file);
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={galleryAddInputRef}
        id={galleryAddInputId}
        type="file"
        accept="image/*"
        multiple
        className={fileInputClassName}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (!files.length) {
            showPickNotice("No se seleccionó archivo");
            return;
          }
          showPickNotice(`Seleccionados: ${files.length}`);
          for (let i = 0; i < files.length; i += 1) {
            const file = files[i];
            if (!file) continue;
            if (gallery.length < 4) onGalleryFile?.(null, file);
            else onGalleryFile?.((activeIndex + i) % 4, file);
          }
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={galleryReplaceInputRef}
        type="file"
        accept="image/*"
        className={fileInputClassName}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (galleryReplaceIndex === null) return;
          onGalleryFile?.(galleryReplaceIndex, file);
          setGalleryReplaceIndex(null);
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={giftReplaceInputRef}
        type="file"
        accept="image/*"
        className={fileInputClassName}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (giftReplaceIndex === null) return;
          onGiftFile?.(giftReplaceIndex, file);
          setGiftReplaceIndex(null);
          e.currentTarget.value = "";
        }}
      />

      <section
        className="relative isolate bg-[#5f5f5f]"
        onDragOver={
          editable
            ? (e) => {
                e.preventDefault();
              }
            : undefined
        }
        onDrop={
          editable
            ? (e) => {
                e.preventDefault();
                const [file] = getFilesFromDrop(e);
                if (file) onHeroFile?.(file);
              }
            : undefined
        }
      >
        {editable ? (
          <label htmlFor={heroInputId} className="relative block h-[420px] w-full cursor-pointer">
            {hero ? <Image src={hero} alt="" fill className="object-cover" priority /> : null}
            <div className="absolute inset-0 bg-black/10" />
          </label>
        ) : (
          <div className="relative h-[420px] w-full">
            {hero ? <Image src={hero} alt="" fill className="object-cover" priority /> : null}
            <div className="absolute inset-0 bg-black/10" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center text-white">
          {editable ? (
            <div className="absolute top-14 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white/25 text-center text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
              <span>CLIC PARA SUBIR FOTO</span>
              <span className="mt-2 text-4xl leading-none">↑</span>
            </div>
          ) : null}

          <p className="text-xs font-semibold uppercase tracking-[0.55em] text-white/90">
            {content.subtitle.toUpperCase()}
          </p>
          <p className="mt-6 text-6xl leading-none sm:text-7xl" style={{ fontFamily: "cursive" }}>
            {names}
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-white/90">
            SAVE THE DATE
          </p>
          <p className="mt-3 font-serif text-xl tracking-[0.45em] text-white">
            {content.dateText}
          </p>
          <div className="mt-8 flex justify-center">
            <span className="inline-flex border border-white/60 px-7 py-3 text-xs font-semibold text-white">
              Añadir al calendario
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto w-full max-w-6xl px-6 font-serif text-zinc-900">
          <div className="text-center">
            <h2 className="text-[56px] font-light leading-none tracking-[0.14em]">
              {content.storyTitle.toUpperCase()}
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-[12px] leading-7 text-zinc-700">
              {content.storyText}
            </p>
          </div>

          <div className="relative mt-16">
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[640px] font-light leading-none text-[#e6d7c6] opacity-25">
              &
            </div>

            <div className="relative z-10 grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_280px_minmax(0,1fr)] md:gap-24">
              <div className="mx-auto w-full max-w-[340px] text-left md:mx-0 md:justify-self-start">
                <p className="text-5xl font-light leading-none">{content.brideStoryTitle}</p>
                <p className="mt-6 text-[12px] leading-7 text-zinc-800">{content.brideStoryText}</p>
              </div>

              <div
                className="relative mx-auto h-[280px] w-[280px] overflow-hidden rounded-full border border-black/10 bg-zinc-200"
                onDragOver={
                  editable
                    ? (e) => {
                        e.preventDefault();
                      }
                    : undefined
                }
                onDrop={
                  editable
                    ? (e) => {
                        e.preventDefault();
                        const [file] = getFilesFromDrop(e);
                        if (file) onAvatarFile?.(file);
                      }
                    : undefined
                }
              >
                {editable ? (
                  <label htmlFor={avatarInputId} className="absolute inset-0 cursor-pointer">
                    <span className="sr-only">Subir foto</span>
                  </label>
                ) : null}
                {content.avatarUrl ? <Image src={content.avatarUrl} alt="" fill className="object-cover" /> : null}
              </div>

              <div className="mx-auto w-full max-w-[340px] text-left md:mx-0 md:justify-self-end">
                <p className="text-5xl font-light leading-none">{content.groomStoryTitle}</p>
                <p className="mt-6 text-[12px] leading-7 text-zinc-800">{content.groomStoryText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="w-full bg-white pt-16"
        onDragOver={
          editable
            ? (e) => {
                e.preventDefault();
              }
            : undefined
        }
        onDrop={
          editable
            ? (e) => {
                e.preventDefault();
                const files = getFilesFromDrop(e);
                if (!files.length) return;
                for (const file of files) {
                  if (gallery.length < 4) onGalleryFile?.(null, file);
                  else onGalleryFile?.(activeIndex, file);
                }
              }
            : undefined
        }
      >
        {editable ? (
          <label htmlFor={galleryAddInputId} className="relative block w-full cursor-pointer overflow-hidden bg-[#3e3e3e]">
            {gallery.length ? (
              <div className="relative h-[360px] w-full sm:h-[420px]">
                <Image src={gallery[activeIndex]} alt="" fill className="object-cover" sizes="1200px" />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            ) : (
              <div className="relative h-[360px] w-full sm:h-[420px]" />
            )}

            <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white/25 text-center text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
              <span>CLIC PARA</span>
              <span>SUBIR FOTOS</span>
              <span className="mt-2 text-4xl leading-none">↑</span>
            </div>
          </label>
        ) : (
          <div className="relative w-full overflow-hidden bg-[#3e3e3e]">
            {gallery.length ? (
              <div className="relative h-[360px] w-full sm:h-[420px]">
                <Image src={gallery[activeIndex]} alt="" fill className="object-cover" sizes="1200px" />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            ) : (
              <div className="relative h-[360px] w-full sm:h-[420px]" />
            )}
          </div>
        )}

        <div className="bg-white py-6">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-4 px-6">
            {Array.from({ length: 4 }).map((_, idx) => {
              const src = gallery[idx] || "";
              return (
                <div
                  key={`${src || "empty"}-${idx}`}
                  className="group relative h-20 w-20 overflow-hidden rounded-md bg-zinc-200"
                >
                  {src ? <Image src={src} alt="" fill className="object-cover" sizes="80px" /> : null}
                  {src ? (
                    <button
                      type="button"
                      onClick={() => setActive(idx)}
                      className="absolute inset-0"
                      aria-label={`Ver imagen ${idx + 1}`}
                    />
                  ) : editable ? (
                    <label
                      htmlFor={galleryAddInputId}
                      className="absolute inset-0 cursor-pointer"
                      aria-label={`Subir imagen ${idx + 1}`}
                    />
                  ) : null}

                  {editable && src ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 transition group-hover:bg-black/40">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGalleryReplaceIndex(idx);
                          galleryReplaceInputRef.current?.click();
                        }}
                        className="w-16 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-zinc-900 opacity-0 transition group-hover:opacity-100"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGalleryRemove?.(idx);
                        }}
                        className="w-16 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-zinc-900 opacity-0 transition group-hover:opacity-100"
                      >
                        Borrar
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="relative border border-[#e8ddcf] bg-white px-8 py-12 text-center">
            <div className="pointer-events-none absolute right-6 top-0 -translate-y-1/2 font-serif text-7xl leading-none text-[#d7c3ab]">
              ”
            </div>
            <p className="mx-auto max-w-3xl font-serif text-3xl leading-snug text-zinc-900">
              {content.quote}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Countdown iso={content.countdownIso} />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="grid items-start gap-14 md:grid-cols-2 md:gap-24">
            <div className="grid grid-cols-[140px_1fr] gap-8">
              <div className="flex items-start justify-center pt-2 text-brand-orange">
                <i className="fa-solid fa-ring text-[76px]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-orange">
                  {content.ceremony.title}
                </p>
                <p className="mt-4 text-sm text-zinc-900">Hora de inicio: {content.ceremony.time}</p>
                <p className="mt-2 text-sm text-zinc-900">{content.ceremony.place}</p>
                <p className="mt-2 text-sm text-zinc-900">{content.ceremony.address}</p>
                <a href="#mapa" className="mt-5 inline-block text-sm text-zinc-800">
                  Ver en mapa
                </a>
              </div>
            </div>

            <div className="grid grid-cols-[140px_1fr] gap-8">
              <div className="flex items-start justify-center pt-2 text-brand-orange">
                <i className="fa-solid fa-bell-concierge text-[76px]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-orange">
                  {content.reception.title}
                </p>
                <p className="mt-4 text-sm text-zinc-900">Hora de inicio: {content.reception.time}</p>
                <p className="mt-2 text-sm text-zinc-900">{content.reception.place}</p>
                <p className="mt-2 text-sm text-zinc-900">{content.reception.address}</p>
                <a href="#mapa" className="mt-5 inline-block text-sm text-zinc-800">
                  Ver en mapa
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#efe6da] py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mt-14 flex flex-wrap items-center justify-center gap-16">
            {Array.from({ length: 3 }).map((_, idx) => {
              const raw = content.gifts?.[idx];
              const gift =
                typeof raw === "string"
                  ? { imageUrl: raw, linkUrl: "" }
                  : raw
                    ? { imageUrl: raw.imageUrl || "", linkUrl: raw.linkUrl || "" }
                    : { imageUrl: "", linkUrl: "" };

              const card = (
                <div
                  className={[
                    "group relative flex h-24 w-[220px] items-center justify-center",
                    editable ? "cursor-pointer" : "",
                  ].join(" ")}
                  onClick={editable ? () => openGiftPicker(idx) : undefined}
                  onDragOver={
                    editable
                      ? (e) => {
                          e.preventDefault();
                        }
                      : undefined
                  }
                  onDrop={
                    editable
                      ? (e) => {
                          e.preventDefault();
                          const [file] = getFilesFromDrop(e);
                          if (!file) return;
                          onGiftFile?.(idx, file);
                        }
                      : undefined
                  }
                >
                  {gift.imageUrl ? (
                    <Image src={gift.imageUrl} alt="" width={320} height={96} className="h-20 w-auto object-contain" />
                  ) : (
                    <div className="h-16 w-full rounded bg-white/15" />
                  )}

                  {editable ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 transition group-hover:bg-black/35">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
                        Click para subir
                      </span>
                      {gift.imageUrl ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onGiftRemove?.(idx);
                          }}
                          className="w-20 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-zinc-900 opacity-0 transition group-hover:opacity-100"
                        >
                          Borrar
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );

              if (!editable && gift.linkUrl && gift.imageUrl) {
                return (
                  <a
                    key={`${gift.imageUrl}-${idx}`}
                    href={gift.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex"
                  >
                    {card}
                  </a>
                );
              }

              return <div key={`${gift.imageUrl || "empty"}-${idx}`}>{card}</div>;
            })}
          </div>
        </div>
      </section>

      <section id="mapa" className="bg-white">
        {content.mapEmbedUrl ? (
          <iframe
            src={content.mapEmbedUrl}
            className="h-[520px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="h-[520px] w-full bg-surface" />
        )}
      </section>
    </article>
  );
}
