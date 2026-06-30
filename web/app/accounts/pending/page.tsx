import Link from "next/link";

export default function PendingPage() {
  return (
    <section className="sx-page-hero sx-page-hero--plain">
      <div className="wrap sx-page-hero__content range-ticks range-ticks--section">
        <p className="section-eyebrow">Pending approval</p>
        <h1>Your account is waiting for admin approval.</h1>
        <p className="sx-page-hero__lede">Astra Labs accounts stay inactive until an admin approves membership.</p>
        <Link className="sx-btn" href="/">Back home</Link>
      </div>
    </section>
  );
}
