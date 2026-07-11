import Link from "next/link";
import { collaborations, fieldGallery } from "../content";
import { bg, Gallery, PageHero, Rows } from "../page-sections";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  title: "Pioneer",
  description:
    "Pioneer is Astra Labs' student-built high-power rocket for Launch Canada 2026 — mechanical, avionics, and operations subsystems designed and tested in-house.",
  path: "/pioneer",
  image: "/images/pick/rocket-canada-pad.jpg",
});

export default function PioneerPage() {
  return (
    <>
      <PageHero
        eyebrow="Vehicle program"
        title="Pioneer is the current build."
        lede="Designed, machined, wired, and tested by students. Every subsystem is integrated in-house — mechanical, electronics, and operations."
        image="/images/pick/rocket-canada-pad.jpg"
        meta={["Student-built", "Bench-tested", "No outsourcing"]}
      />

      <section className="sx-page-body">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Subsystems</p>
            <h2>Designed, simulated, assembled, and tested in-house.</h2>
          </div>
          <Rows
            items={[
              ["MECH", "Mechanical", "Airframe design, OpenRocket simulations, CFD/FEA validation, recovery-system design, and physical integration. Every part is either machined or justified."],
              ["ELEC", "Electronics", "Custom SRAD avionics, STM32 flight computers, KiCad PCB design, sensors, and telemetry systems. Ground-tested before flight."],
              ["OPS", "Operations", "Sponsorships, budget management, logistics, documentation, and launch coordination. The paperwork is as important as the wiring."],
            ]}
          />
        </div>
      </section>

      <section className="sx-split">
        <div className="sx-split__media" style={bg("/images/pick/rocket-airframe-tent.jpg")} role="img" aria-label="Rocket airframe under the range operations tent" />
        <div className="sx-split__copy range-ticks range-ticks--section">
          <p className="section-eyebrow">Integration</p>
          <h2>Subsystems converge at the vehicle.</h2>
          <p>Mechanical, electronics, operations, and documentation feed into one launch-ready configuration. Shared requirements, shared handoff points, shared accountability.</p>
          <Link className="sx-btn" href="#roadmap">
            See the range path
          </Link>
        </div>
      </section>

      <section className="sx-page-body" id="roadmap">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Range path</p>
            <h2>Build, test, document, launch, recover.</h2>
            <p className="sx-page-hero__lede" style={{ marginTop: 12 }}>
              The program map from bench to range day — each phase is a checkpoint with evidence the team reviews before moving on.
            </p>
          </div>
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

      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <div className="sx-page-intro">
            <p className="section-eyebrow">Collaborations</p>
            <h2>Cross-institutional partnerships.</h2>
          </div>
          <Rows items={collaborations.map(([name, text]) => ["Partner", name, text])} />
        </div>
      </section>

      <section className="sx-gallery-band">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Field record</p>
            <h2>Launch days, shop work, and everything in between.</h2>
            <p className="sx-page-hero__lede" style={{ marginTop: 12 }}>Photos from range days, shop sessions, outreach events, and integration work.</p>
          </div>
        </div>
        <Gallery items={fieldGallery} />
      </section>
    </>
  );
}
