import Link from "next/link";
import {
  sponsorFunding,
  sponsorGallery,
  sponsorGoals,
  sponsorPackage,
  sponsorPartnerValue,
  sponsorTiers,
} from "../content";
import { bg, Gallery, PageHero, Rows } from "../page-sections";

export default function SponsorPage() {
  return (
    <>
      <PageHero
        eyebrow="Sponsorship"
        title="Help Seneca students fly real hardware."
        lede="Astra Labs is Team 06 at Seneca Polytechnic. Partners fund fabrication, student workshops, and competition readiness — with progress reported through build logs and photos."
        image="/images/field/aerial-oct2025.jpg"
        meta={["Team 06", "Seneca Polytechnic", "Launch Canada 2026"]}
      />

      <section className="sx-page-body sx-page-body--tight sponsor-example-lab" aria-labelledby="sponsor-example-title">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Sponsor examples</p>
            <h2 id="sponsor-example-title">Example sponsor surfaces we can build around.</h2>
            <p className="sx-page-hero__lede" style={{ marginTop: 12 }}>Fin graphics and electronics artwork can carry partner marks, acknowledgments, or campaign visuals.</p>
          </div>
          <div className="sponsor-example-grid">
            <figure className="sponsor-example-card sponsor-example-card--dark">
              <img src="/media/images/image1.png" alt="Astra Labs circular PCB artwork with sponsor marks" />
              <figcaption>
                <span>Payload PCB artwork</span>
                <small>Partner logos and acknowledgments placed directly into board artwork.</small>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Supporters</p>
            <h2>Backed by organizations helping students build.</h2>
          </div>
          <div className="supporter-strip" aria-label="Astra Labs supporters">
            <img src="/images/partners/robotshop-logo.jpg" alt="RobotShop" />
          </div>
        </div>
      </section>

      <section className="sx-page-body" id="sponsor-package">
        <div className="wrap">
          <div className="sx-package-head">
            <div className="sx-page-intro range-ticks range-ticks--section">
              <p className="section-eyebrow">{sponsorPackage.title}</p>
              <h2>Complete sponsorship package — goals, vehicle, tiers, and next steps.</h2>
              <p className="sx-page-hero__lede" style={{ marginTop: 12 }}>{sponsorPackage.summary}</p>
            </div>
            <div className="sx-package-actions sx-package-actions--side">
              <a className="sx-btn sx-btn--fill" href={sponsorPackage.filename} download>Download PDF</a>
              <a className="sx-btn" href={sponsorPackage.filename} target="_blank" rel="noopener noreferrer">Open in new tab</a>
            </div>
          </div>
          <Rows items={sponsorPackage.contents.map((item, index) => [String(index + 1).padStart(2, "0"), item, ""])} label="Sponsorship package contents" />
        </div>
      </section>

      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Goals</p>
            <h2>What sponsorship helps us deliver.</h2>
          </div>
          <Rows items={sponsorGoals.map(([title, text]) => ["→", title, text])} />
        </div>
      </section>

      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <div className="sx-page-intro">
            <p className="section-eyebrow">Sponsorship tiers</p>
            <h2>Flexible levels for your organization.</h2>
            <p className="sx-page-hero__lede" style={{ marginTop: 12 }}>All tiers include regular project updates and a personalized certificate of appreciation. Contributions can be monetary, in-kind, or services.</p>
          </div>
          <div className="table-wrap" style={{ marginTop: 24 }}>
            <table className="site-table">
              <thead>
                <tr><th>Tier</th><th>Investment (CAD)</th><th>Benefits</th></tr>
              </thead>
              <tbody>
                {sponsorTiers.map(([name, amount, benefits]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{amount}</td>
                    <td>
                      <ul className="sx-tier-list">
                        {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sx-split">
        <div className="sx-split__copy range-ticks range-ticks--section">
          <p className="section-eyebrow">Why partner</p>
          <h2>Your support moves hardware, not just marketing.</h2>
          <p>Sponsorship buys flight materials, shop tooling, workshop kits, and the trip that proves the vehicle on the range.</p>
          <p className="sx-page-hero__lede" style={{ marginTop: 16 }}><Link href="/about">About the club</Link> covers mission, leadership, and faculty advisors. The PDF above has Pioneer specs and competition details.</p>
        </div>
        <div className="sx-split__media" style={bg("/images/field/team-group-01.jpg")} role="img" aria-label="Astra Labs crew at the launch area" />
      </section>

      <section className="sx-page-body">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Where support goes</p>
            <h2>Four areas that move Pioneer from bench to range.</h2>
          </div>
          <Rows items={sponsorFunding.map(([title, text], index) => [String(index + 1).padStart(2, "0"), title, text])} />
        </div>
      </section>

      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <div className="sx-page-intro">
            <p className="section-eyebrow">Partner value</p>
            <h2>What sponsors get back.</h2>
          </div>
          <Rows items={sponsorPartnerValue.map(([title, text]) => ["→", title, text])} />
        </div>
      </section>

      <section className="sx-gallery-band">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Program gallery</p>
            <h2>The crew, the workshops, and the vehicle in the field.</h2>
            <p className="sx-page-hero__lede" style={{ marginTop: 12 }}>Recent photos from outreach events, payload workshops, and integration work behind Pioneer.</p>
          </div>
        </div>
        <Gallery items={sponsorGallery} />
      </section>

      <section className="sx-cta-band">
        <div className="wrap">
          <p className="section-eyebrow">Next step</p>
          <h2 style={{ margin: "12px 0 0", fontSize: "clamp(28px,4vw,40px)", fontWeight: 600 }}>Let's talk about a partnership.</h2>
          <p className="sx-page-hero__lede" style={{ margin: "16px auto 0", maxWidth: "48ch" }}>Questions, custom proposals, or pledges — reach out to the team leads listed in the sponsorship package.</p>
          <div className="sx-package-actions sx-package-actions--center" style={{ marginTop: 28 }}>
            <a className="sx-btn sx-btn--fill" href={`mailto:${sponsorPackage.contactEmail}`}>Email Astra Labs</a>
            <a className="sx-btn" href={sponsorPackage.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a className="sx-btn" href={sponsorPackage.filename} download>Download package</a>
          </div>
        </div>
      </section>
    </>
  );
}
