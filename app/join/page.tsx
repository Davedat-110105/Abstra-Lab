import { clubSignupUrl } from "../content";
import { SectionPage } from "../page-sections";

export default function JoinPage() {
  return (
    <SectionPage
      title="Join the Crew"
      lede="Show up to a work session, pick a stream, and learn on real club hardware."
      meta={["Open intake", "No experience required", "Seneca students"]}
      sections={[
        {
          label: "How it works",
          heading: "The fastest path in is a small, real task.",
          items: [
            ["01", "Find the next session", "Use the club signup link or ask a member where the next build or planning session is."],
            ["02", "Choose a workstream", "Mechanical, electronics, operations, documentation, sponsorship, or outreach."],
            ["03", "Document the handoff", "Leave notes, photos, or test results the next member can use."],
          ],
        },
        {
          label: "Good first tasks",
          heading: "You do not need to start with the hardest subsystem.",
          items: [
            ["Shop", "Inventory & prep", "Label parts, organize fasteners, photograph assemblies, update the build record."],
            ["Design", "CAD & review", "Model fixtures, trace dimensions, or prepare review notes in OpenRocket."],
            ["Ops", "Sponsorship & events", "Club booths, partner outreach, sponsor packages, and post-event notes."],
          ],
        },
      ]}
      cta={{ label: "Open Seneca club signup", href: clubSignupUrl }}
    />
  );
}
