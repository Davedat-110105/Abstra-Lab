import Link from "next/link";

export function bg(path: string) {
  return { backgroundImage: `url('${path}')` };
}

export function PageHero({
  eyebrow,
  title,
  lede,
  image,
  meta = [],
}: Readonly<{
  eyebrow: string;
  title: string;
  lede: string;
  image?: string;
  meta?: readonly string[];
}>) {
  return (
    <section className={`sx-page-hero${image ? "" : " sx-page-hero--plain"}`} style={image ? bg(image) : undefined}>
      <div className="wrap sx-page-hero__content range-ticks range-ticks--section">
        <p className="section-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="sx-page-hero__lede">{lede}</p>
        {meta.length > 0 && (
          <div className="sx-page-hero__meta" aria-label={`${eyebrow} facts`}>
            {meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function Rows({ items, label }: Readonly<{ items: readonly (readonly [string, string, string])[]; label?: string }>) {
  return (
    <div className="sx-rows" aria-label={label}>
      {items.map(([code, title, text]) => (
        <article key={`${code}-${title}`}>
          <span>{code}</span>
          <div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function Gallery({
  items,
}: Readonly<{ items: readonly (readonly [string, string, string, string])[] }>) {
  return (
    <div className="work-gallery__grid work-gallery__grid--bleed">
      {items.map(([image, title, caption, modifier]) => (
        <figure className={`work-gallery__item${modifier ? ` work-gallery__item--${modifier}` : ""}`} key={image}>
          <img src={`/images/${image}`} alt={title} loading="lazy" />
          <figcaption>
            <span>{title}</span>
            <small>{caption}</small>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function SectionPage({
  title,
  lede,
  meta,
  sections,
  cta,
}: Readonly<{
  title: string;
  lede: string;
  meta: readonly string[];
  sections: readonly {
    label: string;
    heading: string;
    items: readonly (readonly [string, string, string])[];
  }[];
  cta?: { label: string; href: string };
}>) {
  return (
    <>
      <PageHero eyebrow={title} title={title} lede={lede} meta={meta} />
      {sections.map((section, index) => (
        <section className={`sx-page-body${index === sections.length - 1 ? " sx-page-body--tight" : ""}`} key={section.label}>
          <div className="wrap">
            <div className={`sx-page-intro${index === 0 ? " range-ticks range-ticks--section" : ""}`}>
              <p className="section-eyebrow">{section.label}</p>
              <h2>{section.heading}</h2>
            </div>
            <Rows items={section.items} />
          </div>
        </section>
      ))}
      {cta && (
        <section className="sx-cta-band">
          <div className="wrap">
            <p className="section-eyebrow">Next step</p>
            <Link className="sx-btn sx-btn--fill" href={cta.href} style={{ marginTop: 24 }}>
              {cta.label}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
