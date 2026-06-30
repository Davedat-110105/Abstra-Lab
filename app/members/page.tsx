import { SectionPage } from "../page-sections";

export default function MembersPage() {
  return (
    <SectionPage
      title="Members"
      lede="The crew behind Astra Labs — builders, organizers, documentation leads, and new students learning SolidWorks, KiCad, and OpenRocket on real hardware."
      meta={["Seneca students", "Open intake", "Project teams"]}
      sections={[
        {
          label: "Crew structure",
          heading: "Members join a workstream, then learn by doing.",
          items: [
            ["MECH", "Mechanical & airframe", "CAD in SolidWorks, OpenRocket simulations, fabrication, recovery hardware, and integration."],
            ["ELEC", "Avionics & telemetry", "KiCad PCBs, STM32 firmware, sensors, wiring, and ground-station capture."],
            ["OPS", "Operations & documentation", "Sponsorship, procurement, launch logistics, events, and the build log."],
          ],
        },
        {
          label: "Membership notes",
          heading: "Consistent contribution matters more than prior experience.",
          items: [
            ["Access", "Seneca students only", "Any program can join. Technical experience helps but is not required."],
            ["Time", "About 5 hours per week", "Members show up regularly enough for teammates to depend on handoffs."],
            ["Reference", "Six-month minimum", "Reference letters require sustained, visible contribution to the program."],
          ],
        },
      ]}
    />
  );
}
