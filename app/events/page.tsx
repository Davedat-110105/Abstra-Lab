import { clubSignupUrl, eventFaqs, workshop } from "../content";
import { getPublicEvents } from "../../lib/public-content";
import { bg, PageHero, Rows } from "../page-sections";
import { pageMetadata } from "../seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Events",
  description:
    "Work sessions, payload workshops, and launches at Astra Labs. New members are welcome year-round — no prior rocketry experience required.",
  path: "/events",
  image: "/images/pick/outreach-raise-rocket.jpg",
});

export default async function EventsPage() {
  const events = await getPublicEvents();

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="How to enter the program."
        lede="New members are welcome year-round. No prior rocketry experience is required. We look for curiosity, consistency, and clear documentation."
        image="/images/pick/outreach-raise-rocket.jpg"
        meta={["Open intake", "5 hr / week expected", "Seneca students only"]}
      />

      <section className="sx-page-body">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Entry points</p>
            <h2>Work sessions, outreach events, and launches with real hardware behind them.</h2>
          </div>
          <div className="sx-rows">
            {events.length ? (
              events.map((event) => (
                <article className="event-row" key={event.slug}>
                  <span>{event.date_label}</span>
                  <div>
                    {event.media_url && event.is_video ? (
                      <video className="event-row__media" src={event.media_url} controls muted playsInline />
                    ) : event.media_url ? (
                      <img className="event-row__media" src={event.media_url} alt={event.title} />
                    ) : null}
                    <h3>{event.title}</h3>
                    {event.summary && <p className="event-row__summary">{event.summary}</p>}
                    <p>{event.description}</p>
                    {event.location && <p className="event-row__meta">{event.location}</p>}
                  </div>
                </article>
              ))
            ) : (
              <article>
                <span>—</span>
                <div><p>No published events loaded yet.</p></div>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="sx-split">
        <div className="sx-split__media" style={bg("/images/pick/workshop-floor.jpg")} role="img" aria-label="Students assembling airframe and composite hardware" />
        <div className="sx-split__copy range-ticks range-ticks--section">
          <p className="section-eyebrow">{workshop.title}</p>
          <h2>Hands-on payload builds for fifty students.</h2>
          <p>{workshop.summary}</p>
          <div className="sx-rows" style={{ marginTop: 28, borderTop: "none" }}>
            {workshop.highlights.map(([label, text]) => (
              <article style={{ padding: "16px 0" }} key={label}>
                <span>{label}</span>
                <div><p style={{ margin: 0 }}>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <div className="sx-page-intro">
            <p className="section-eyebrow">FAQ</p>
            <h2>Common questions before your first session.</h2>
          </div>
          <Rows items={eventFaqs.map(([question, answer]) => ["Q", question, answer])} />
        </div>
      </section>

      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <div className="sx-page-intro">
            <p className="section-eyebrow">Links</p>
            <h2>Sign up and follow the crew.</h2>
          </div>
          <div aria-label="Astra Labs external links">
            <a className="sx-link-row" href={clubSignupUrl}><span>01</span>Join the club</a>
            <a className="sx-link-row" href="https://www.instagram.com/astra.labs.engineers/"><span>02</span>Instagram</a>
            <a className="sx-link-row" href="https://www.linkedin.com/company/astra-labs-engineers/"><span>03</span>LinkedIn</a>
          </div>
        </div>
      </section>
    </>
  );
}
