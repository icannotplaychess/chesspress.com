export function PageHero({
  kicker,
  title,
  titleItalic,
  description,
  align = "center",
}: {
  kicker?: string;
  title: string;
  titleItalic?: string;
  description?: string;
  align?: "center" | "left";
}) {
  const alignClass = align === "center" ? "text-center" : "text-left";
  return (
    <section className={`py-8 md:py-10 ${alignClass}`}>
      {kicker && <div className="font-mono-label">{kicker}</div>}
      <h1 className="font-serif font-normal text-[clamp(36px,7vw,72px)] leading-[0.95] my-3">
        {title}
        {titleItalic && (
          <>
            {" "}
            <i className="text-[var(--brand)]">{titleItalic}</i>
          </>
        )}
      </h1>
      {description && (
        <p
          className={`text-sm text-[var(--mute)] m-0 ${align === "center" ? "max-w-xl mx-auto" : "max-w-xl"}`}
        >
          {description}
        </p>
      )}
    </section>
  );
}
