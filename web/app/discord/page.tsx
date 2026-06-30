import { SectionPage } from "../page-sections";

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
