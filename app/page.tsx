import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  description:
    "Astra Labs is a student rocketry club at Seneca Polytechnic building Pioneer, a high-power rocket for Launch Canada 2026. Follow the build in the open.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/" },
};

function bg(path: string) {
  return { backgroundImage: `url('${path}')` };
}

export default function Home() {
  return (
    <>
      <section className="sx-hero is-loaded" aria-label="Pioneer program overview">
        <div className="sx-hero__bg" role="presentation" style={bg("/images/hero-launch.jpg")} />
        <div className="sx-hero__content reveal visible">
          <h1>Pioneer</h1>
          <p>Student-built high-power rocket for Launch Canada 2026.</p>
          <div className="sx-hero__actions">
            <Link className="sx-btn" href="/pioneer">
              The vehicle
            </Link>
            <Link className="sx-btn sx-btn--fill" href="/join">
              Join the crew
            </Link>
          </div>
        </div>
        <div className="sx-scroll-hint" aria-hidden="true" />
      </section>

      <section className="sx-split" aria-labelledby="home-about-heading">
        <div
          className="sx-split__media"
          role="img"
          aria-label="Astra Labs crew during a field operations day"
          style={bg("/images/pick/team-range-crew.jpg")}
        />
        <div className="sx-split__copy range-ticks range-ticks--section reveal visible">
          <p className="section-eyebrow">Seneca Polytechnic</p>
          <h2 id="home-about-heading">Engineering students building real flight hardware.</h2>
          <p>
            No formal aerospace background required. We design, machine, wire, test, and document
            every subsystem in the open — airframe, avionics, recovery, and payload.
          </p>
          <Link className="sx-btn" href="/about">
            About the club
          </Link>
        </div>
      </section>

      <section className="sx-block" aria-labelledby="home-bench-heading">
        <div className="sx-block__bg" role="presentation" style={bg("/images/subsystems-engine.jpg")} />
        <div className="sx-block__inner reveal visible">
          <h2 id="home-bench-heading">Every interface earned on the bench.</h2>
          <p>
            From OpenRocket simulations to STM32 flight computers — Pioneer is designed, assembled,
            and tested by students at Seneca.
          </p>
          <Link className="sx-btn" href="/pioneer">
            Inspect Pioneer
          </Link>
        </div>
      </section>

      <section className="sx-stats range-ticks reveal visible" aria-label="Pioneer program targets">
        <div className="sx-stat">
          <strong>
            2.8<span style={{ fontSize: "0.45em", verticalAlign: "super" }}>km</span>
          </strong>
          <span>Target apogee</span>
        </div>
        <div className="sx-stat">
          <strong>50</strong>
          <span>Picosatellite slots</span>
        </div>
        <div className="sx-stat">
          <strong>2026</strong>
          <span>Launch Canada</span>
        </div>
      </section>

      <section className="sx-split" aria-labelledby="home-workshop-heading">
        <div className="sx-split__copy range-ticks range-ticks--section reveal visible">
          <p className="section-eyebrow">Outreach</p>
          <h2 id="home-workshop-heading">Payload workshops feed the Pioneer program.</h2>
          <p>Weekly CanSat-style sessions with Seneca Developers Club — the on-ramp for new builders.</p>
          <Link className="sx-btn" href="/events">
            Events &amp; workshops
          </Link>
        </div>
        <div
          className="sx-split__media"
          role="img"
          aria-label="Students working on rocket hardware in the shop"
          style={bg("/images/pick/workshop-mentor.jpg")}
        />
      </section>

      <section className="sx-split" aria-labelledby="home-posts-heading">
        <div
          className="sx-split__media"
          role="img"
          aria-label="Crew documenting bench work and ship notes"
          style={bg("/images/pick/workshop-layup.jpg")}
        />
        <div className="sx-split__copy range-ticks range-ticks--section reveal visible">
          <p className="section-eyebrow">Build log</p>
          <h2 id="home-posts-heading">Ship notes and bench updates, posted often.</h2>
          <p>
            Frequent crew updates — integration wins, test results, and handoffs for Pioneer. This
            is where we publish more than the rest of the site.
          </p>
          <Link className="sx-btn" href="/posts">
            Read the posts
          </Link>
        </div>
      </section>

      <section className="sx-block">
        <div className="sx-block__bg" style={bg("/images/pick/range-road.jpg")} />
        <div className="sx-block__inner reveal visible">
          <h2>Partner with Astra Labs.</h2>
          <p>Partners fund fabrication, workshops, and competition readiness. See where support goes.</p>
          <Link className="sx-btn sx-btn--fill" href="/sponsor">
            Sponsor the mission
          </Link>
        </div>
      </section>

      <section className="sx-split">
        <div className="sx-split__copy reveal visible">
          <p className="section-eyebrow">Program map</p>
          <h2>From payload workshops to Launch Canada.</h2>
          <p>
            See how Pioneer moves through payload planning, vehicle integration, ground station
            work, and competition readiness.
          </p>
          <Link className="sx-btn" href="/projects">
            View projects
          </Link>
        </div>
        <div className="sx-split__media" style={bg("/images/pick/club-booth.jpg")} />
      </section>
    </>
  );
}
