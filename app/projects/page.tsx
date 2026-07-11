import Link from "next/link";
import { destinations } from "../content";
import { bg, PageHero, Rows } from "../page-sections";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "The Pioneer program map — payload planning, vehicle integration, telemetry, recovery, and Launch Canada operations, tracked from build bench to range day.",
  path: "/projects",
  image: "/images/mission-earth.jpg",
});

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="The program map from build bench to range day."
        lede="These are the major places Pioneer has to pass through: payload planning, vehicle integration, telemetry, recovery, and Launch Canada operations."
        image="/images/mission-earth.jpg"
        meta={["Vehicle roadmap", "Competition path", "Ground station"]}
      />
      <section className="sx-page-body">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Roadmap</p>
            <h2>A mission map for the work that still has to converge.</h2>
          </div>
          <Rows items={destinations} label="Pioneer destination roadmap" />
        </div>
      </section>
      <section className="sx-split">
        <div className="sx-split__copy range-ticks range-ticks--section">
          <p className="section-eyebrow">Range path</p>
          <h2>Build, test, document, launch, recover.</h2>
          <p>Each destination is a checkpoint with evidence the team can review before moving to the next phase.</p>
          <Link className="sx-btn" href="/pioneer">Inspect Pioneer</Link>
        </div>
        <div className="sx-split__media" style={bg("/images/pick/rocket-pad-close.jpg")} role="img" aria-label="High-power rocket staged on the launch pad" />
      </section>
      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <Rows
            label="Pioneer range path"
            items={[
              ["01", "Bench build", "Machine, wire, and document subsystems before they meet at integration."],
              ["02", "Subsystem test", "Controlled tests with recorded setup, expected result, and actual result."],
              ["03", "Integration review", "Fit checks, interface verification, and recovery-system validation."],
              ["04", "Range operations", "Launch Canada logistics, telemetry capture, and flight-day procedures."],
              ["05", "Recovery record", "Post-flight inspection, data download, and lessons for the next iteration."],
            ]}
          />
        </div>
      </section>
    </>
  );
}
