import { clubSignupUrl, contact, discordInviteUrl, sponsorPackage } from "../content";
import { PageHero, Rows } from "../page-sections";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  title: "Contact us",
  description:
    "Contact Astra Labs — email the team, connect on LinkedIn, join the Discord, or find the club at Seneca Polytechnic's Newnham campus.",
  path: "/contact",
  image: "/images/pick/club-booth.jpg",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Reach the crew."
        lede="Sponsorship, media, joining the club, or a technical question — one inbox, and the Discord for anything quick."
        image="/images/pick/club-booth.jpg"
        meta={["Seneca Polytechnic", "Team 06", "Launch Canada 2026"]}
      />

      <section className="sx-page-body">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Channels</p>
            <h2>Pick the channel that fits.</h2>
          </div>
          <Rows
            label="Contact channels"
            items={[
              ["Email", contact.email, "Sponsorship proposals, partnerships, media, and anything that needs a written record."],
              ["Discord", discordInviteUrl ? "Open the server" : "Invite on request", "Day-to-day coordination, quick questions, and work-session updates."],
              ["LinkedIn", "Astra Labs Engineers", "Company page for announcements, milestones, and professional contact."],
              ["Campus", contact.campus, contact.address],
            ]}
          />
          <div className="sx-hero__actions" style={{ marginTop: 32 }}>
            <a className="sx-btn sx-btn--fill" href={`mailto:${contact.email}`}>Email Astra Labs</a>
            {discordInviteUrl ? (
              <a className="sx-btn" href={discordInviteUrl} target="_blank" rel="noopener noreferrer">Open Discord</a>
            ) : (
              <a className="sx-btn" href={`mailto:${contact.email}?subject=Discord%20invite`}>Request Discord invite</a>
            )}
            <a className="sx-btn" href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </section>

      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <div className="sx-page-intro">
            <p className="section-eyebrow">Shortcuts</p>
            <h2>Common reasons to write.</h2>
          </div>
          <Rows
            items={[
              ["01", "Sponsor the mission", "Download the package and email us with a tier or a custom proposal."],
              ["02", "Join the club", "Seneca students register through the official club signup, then join a work session."],
              ["03", "Press & outreach", "Talks, demos, and school visits — tell us the date and audience."],
            ]}
          />
          <div className="sx-hero__actions" style={{ marginTop: 32 }}>
            <a className="sx-btn" href={sponsorPackage.filename} download>Download sponsorship package</a>
            <a className="sx-btn" href={clubSignupUrl} target="_blank" rel="noopener noreferrer">Seneca club signup</a>
          </div>
        </div>
      </section>
    </>
  );
}
