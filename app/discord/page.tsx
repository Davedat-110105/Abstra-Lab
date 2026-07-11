import { SectionPage } from "../page-sections";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  title: "Discord",
  description:
    "Astra Labs on Discord — day-to-day coordination for work sessions, quick questions, and handoffs. The website stays the durable record.",
  path: "/discord",
});

export default function DiscordPage() {
  return (
    <SectionPage
      title="Discord"
      lede="Day-to-day coordination — work sessions, quick questions, and handoffs."
      meta={["Member coordination", "Build updates", "Fast questions"]}
      sections={[
        {
          label: "Use it for",
          heading: "Discord is live; the website is the durable record.",
          items: [
            ["Sessions", "Where to be", "Meeting locations, build timing, and short-notice changes."],
            ["Questions", "Get help early", "Tooling help, file handoffs, and review requests."],
            ["Handoffs", "Move work into the log", "Record important decisions in the build log after the conversation wraps up."],
          ],
        },
      ]}
    />
  );
}
