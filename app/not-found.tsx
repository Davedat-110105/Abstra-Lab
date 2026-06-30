import Link from "next/link";

export default function NotFound() {
  return (
    <section className="sx-page-hero sx-page-hero--plain">
      <div className="wrap sx-page-hero__content range-ticks range-ticks--section">
        <p className="section-eyebrow">404</p>
        <h1>Page not found.</h1>
        <p className="sx-page-hero__lede">This route has not been moved into the Next app yet.</p>
        <Link className="sx-btn sx-btn--fill" href="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}
