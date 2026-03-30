type XVTemplateProps = {
  celebrantName: string;
  dateText: string;
  title?: string;
};

export function XVTemplate({ celebrantName, dateText, title }: XVTemplateProps) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold text-brand-purple">{title ?? "XV Años"}</p>
      <p className="mt-3 font-serif text-4xl text-zinc-900">{celebrantName}</p>
      <p className="mt-3 text-sm text-zinc-600">{dateText}</p>
      <div className="mt-6 h-2 w-24 rounded-full bg-brand-orange" />
    </section>
  );
}
