import Link from "next/link";
import { judgingPhases, launchCanada, launchCanadaGallery } from "../content";
import { bg, Gallery, PageHero, Rows } from "../page-sections";
import { pageMetadata } from "../seo";
import { LaunchCanadaVideos } from "./videos";

export const metadata = pageMetadata({
  title: "Launch Canada",
  description:
    "Astra Labs at the Launch Canada Challenge 2026 — how judges assess Pioneer across design documentation, build quality, range operations, and flight performance.",
  path: "/launch-canada",
  image: "/images/pick/lc-team-portrait.jpg",
});

export default function LaunchCanadaPage() {
  return (
    <>
      <PageHero
        eyebrow="Competition"
        title={launchCanada.name}
        lede={launchCanada.summary}
        image="/images/pick/lc-team-portrait.jpg"
        meta={[launchCanada.team, "Seneca Polytechnic", "Pioneer"]}
      />

      <section className="sx-page-body">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Judging phases</p>
            <h2>How judges assess the quality of the vehicle and the team.</h2>
            <p className="sx-page-hero__lede" style={{ marginTop: 12 }}>
              Half the score is the documented engineering process, analyses, design, and build quality. The other half is performance, operations, and team conduct at the competition.
            </p>
          </div>
          <Rows items={judgingPhases} label="Launch Canada judging phases" />
        </div>
      </section>

      <section className="sx-split">
        <div className="sx-split__media" style={bg("/images/pick/lc-judging-pioneer.jpg")} role="img" aria-label="Launch Canada judge assessing Pioneer at the tent" />
        <div className="sx-split__copy range-ticks range-ticks--section">
          <p className="section-eyebrow">Build-quality interview</p>
          <h2>Judges at the vehicle, not just the report.</h2>
          <p>On conference day the judges come to the table. They check manufacturing, integration, and assembly, and they ask the team to justify every deviation between the as-built vehicle and the Final Design Report.</p>
          <Link className="sx-btn" href="/pioneer">
            Inspect Pioneer
          </Link>
        </div>
      </section>

      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <div className="sx-page-intro">
            <p className="section-eyebrow">Scoring</p>
            <h2>What the score is made of.</h2>
          </div>
          <Rows
            label="Launch Canada scoring"
            items={[
              ["50%", "Engineering process", "Final Design Report, initial presentation, progress updates, and the build-quality interview. On-time deliverables count toward project management."],
              ["50%", "Performance & conduct", "Flight score against the locked-in target altitude, an efficiency score from total motor impulse, nominal recovery, and safety and conduct observed on the range."],
              ["Bonus", "Operational payload", "A valid Payload Challenge entry that flies on board and is confirmed operational at post-flight inspection earns fixed bonus points."],
            ]}
          />
        </div>
      </section>

      <section className="sx-gallery-band">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Launch Canada</p>
            <h2>On the range and in the arena.</h2>
            <p className="sx-page-hero__lede" style={{ marginTop: 12 }}>Photos from the competition briefing, check-in, judging, and the launch range.</p>
          </div>
        </div>
        <Gallery items={launchCanadaGallery} />
      </section>

      <LaunchCanadaVideos />

      <section className="sx-cta-band">
        <div className="wrap">
          <p className="section-eyebrow">Organizer</p>
          <a className="sx-btn sx-btn--fill" href={launchCanada.url} target="_blank" rel="noopener noreferrer" style={{ marginTop: 24 }}>
            Visit launchcanada.org
          </a>
        </div>
      </section>
    </>
  );
}
