export const collaborations = [
  [
    "York University",
    "Cross-institutional rocketry partnership — shared test culture and launch-day coordination.",
  ],
  [
    "Seneca Developers Club",
    "Joint picosatellite workshop series — 50 students building CanSat-style payloads in teams.",
  ],
] as const;

export const fieldGallery = [
  ["pick/team-range-alt.jpg", "Crew on the range", "Astra Labs members with the vehicle at Launch Canada — full team on the sand.", "feature"],
  ["pick/ground-station.jpg", "Ground station", "Telemetry and range electronics staged for flight operations.", ""],
  ["pick/range-ops-laptop.jpg", "Flight ops", "Range-side laptop work during launch-day coordination.", ""],
  ["pick/range-crowd.jpg", "Range crowd", "Students and teams gathering for launch windows.", "wide"],
  ["pick/antenna-crew.jpg", "Telemetry tower", "Crew at the antenna mast supporting range communications.", ""],
  ["pick/seneca-display-rockets.jpg", "Display rockets", "Astra Labs members with student-built rockets outside Seneca.", "feature"],
  ["pick/range-lake.jpg", "Range landscape", "Open water and sky near the launch area — where Pioneer aims to fly.", "wide"],
  ["pick/range-forest.jpg", "Launch corridor", "Forest edge and clear sky above the practice range.", ""],
  ["pick/range-path.jpg", "Range path", "Access trail through the launch site terrain.", ""],
  ["pick/workshop-tape.jpg", "Composite layup", "Students laying composite material on airframe tooling.", "tall"],
  ["pick/cslc-sponsors.jpg", "CSLC sponsors", "Canadian Space Launch Conference sponsor board and partners.", ""],
  ["pick/cslc-museum.jpg", "Aviation museum", "Historic aircraft on the conference venue floor.", ""],
  ["pick/cslc-museum-hangar.jpg", "Hangar exhibits", "Aerospace history exhibits from the conference venue.", "wide"],
  ["pick/helix-talk.jpg", "Campus talk", "Seneca HELIX session — program outreach to the wider student body.", "feature"],
] as const;

export const leadership = [
  {
    name: "Saiprasad Dhodi",
    role: "President · Avionics & Payload Lead",
    responsibility: "Strategic direction, competition readiness, and cross-subsystem integration.",
  },
  {
    name: "Roger Lungsee",
    role: "Vice-President · Mechanical",
    responsibility: "Team operations, fabrication coordination, and technical support.",
  },
  {
    name: "Danielle Heron",
    role: "Treasurer",
    responsibility: "Club finances, sponsorship outreach, and budget stewardship.",
  },
];

export const values = [
  ["Reliability over complexity", "Flight-critical systems lean on proven commercial off-the-shelf hardware so the vehicle and payload survive the mission."],
  ["Safety without compromise", "Every member is a safety officer. Launch Canada and CAR codes are non-negotiable."],
  ["Radical transparency", "Subsystem leads share interfaces and decisions through one documented source of truth."],
  ["Redundancy as standard", "Recovery, logging, and critical paths are designed so one failure does not end the mission."],
  ["Documentation for the future", "Engineering is half technical and half logistics. We document so the next Seneca crew starts ahead of us."],
] as const;

export const faculty = ["Sundar Manku", "Dieter Hastings", "David Jong", "Harry Maghera"];
export const partners = ["Seneca Helix", "School of Information Technology Administration & Security"];
export const disciplines = [
  "Aerodynamics",
  "Structural analysis",
  "Propulsion",
  "Electronics",
  "Control systems",
  "Safety protocols",
  "Project management",
  "Manufacturing",
  "CAD design",
];
export const programs = ["EEN", "EET", "EMA", "MIT", "ECT", "Management", "Marketing", "Sponsorship"];

export const destinations = [
  ["01", "Payload rideshare", "Fifty student-designed picosatellites in a suborbital rideshare simulation — the commercial launch model, at college scale."],
  ["02", "Vehicle integration", "Airframe, recovery, avionics, and operations converging on one launch-ready Pioneer configuration."],
  ["03", "Ground station", "Telemetry capture and authenticated flight records through the club ground-station system."],
  ["04", "Launch Canada 2026", "Team 06 moving from bench tests and documentation to competition readiness on the range."],
] as const;

export const clubSignupUrl =
  "https://clubs.ssfinc.ca/club_signup?group_type=&search=astra+labs&category_tags=&all_my_groups=all_groups&order=name_asc";

export const workshop = {
  title: "Picosatellite workshop series",
  summary:
    "Astra Labs and Seneca Developers Club run a seven-week CanSat-style workshop for ~50 students — teams of four to six build, code, and test picosatellite payloads that feed directly into Pioneer's rideshare simulation.",
  highlights: [
    ["50 students", "Teams of 4–6 across software, hardware, data, structures, and mission science roles."],
    ["7 sessions", "From kit intro through sensors, telemetry, soldering, and a real drop test."],
    ["Mission link", "Workshop payloads practice the same rideshare interfaces Pioneer will fly at Launch Canada."],
  ],
} as const;

export const eventFaqs = [
  ["Do I need prior rocketry experience?", "No. We welcome all skill levels and teach tooling on the job."],
  ["What programs can join?", "Any Seneca student regardless of major."],
  ["Do I need to be a Seneca student?", "Yes — membership is limited to current Seneca Polytechnic students."],
  ["What is the time commitment?", "About 5 hours per week. Six-month minimum for a reference letter."],
  ["When can I join?", "Anytime. New members are accepted continuously through the year."],
] as const;

export const sponsorPackage = {
  filename: "/docs/sponsorship-package-astra-labs.pdf",
  title: "Sponsorship Package",
  summary:
    "The full sponsor deck — goals, Pioneer vehicle overview, tier benefits, investment levels, and next steps. Download or view inline below.",
  contactEmail: "astralabsengineering@gmail.com",
  linkedinUrl: "https://www.linkedin.com/company/astra-labs-engineers/",
  contents: [
    "Goals and objectives",
    "Project and competition details",
    "Pioneer vehicle overview",
    "Benefits for sponsors",
    "Sponsorship tiers and investment",
    "Next steps and contacts",
  ],
} as const;

export const sponsorGoals = [
  ["Educational outreach", "Hands-on workshops and payload programs that bring new Seneca students into aerospace work."],
  ["Program communications", "Documented build logs, media, and milestone updates sponsors can follow and share."],
  ["Competition participation", "Launch Canada Challenge readiness — from bench tests to range operations."],
  ["Certification achievements", "Safety codes, ground testing, and competition compliance as measurable milestones."],
] as const;

export const sponsorTiers = [
  ["Bronze", "$500+", ["Logo on team website and social media posts", "Acknowledgment in YouTube Shorts credits", "Access to team resume book for recruitment"]],
  ["Silver", "$1,500+", ["All Bronze benefits", "Dedicated social media shoutout and video mention", "Invitation to campus launch demos"]],
  ["Gold", "$3,500+", ["All Silver benefits", "Priority access for company info sessions or workshops", "Custom thank-you video"]],
  ["Honour", "$4,000+", ["All Gold benefits", "Exclusive recruitment event or team presentation", "Model rocket replica"]],
] as const;

export const sponsorFunding = [
  ["Vehicle & payload", "Airframe materials, recovery hardware, avionics boards, fasteners, and picosatellite workshop kits for student payloads."],
  ["Fabrication & test", "Shop tooling, measurement gear, ground-test fixtures, and safe integration supplies for bench validation."],
  ["Competition readiness", "Launch Canada registration, range operations support, and student travel so the team can prove the vehicle in competition."],
  ["Education & outreach", "Workshop consumables, club events, and recruitment so new Seneca students can join without prior aerospace experience."],
] as const;

export const sponsorPartnerValue = [
  ["Visibility", "Recognition on the website, event materials, and the student-built vehicle where competition rules allow."],
  ["Talent pipeline", "Meet students practicing CAD, KiCad, embedded firmware, fabrication, sponsorship, and technical documentation."],
  ["Evidence", "Progress reports through build logs, photo updates, and milestone summaries throughout the season."],
  ["Legacy", "Support leaves a permanent technical foundation at Seneca Polytechnic for crews after Launch Canada 2026."],
] as const;

export const sponsorGallery = [
  ["pick/team-range-portrait.jpg", "Team on the pad", "Full crew portrait with the vehicle on the Launch Canada range.", "feature"],
  ["pick/ground-station-alt.jpg", "Electronics table", "Avionics and ground-support gear ready for flight windows.", ""],
  ["pick/range-under-tent.jpg", "Range tent", "Briefing and prep under the operations tent.", ""],
  ["pick/outreach-model-alt.jpg", "Student builder", "New members meeting the club through model rockets and demos.", ""],
  ["pick/cslc-banquet.jpg", "Industry banquet", "Canadian Space Launch Conference dinner with aerospace partners.", "wide"],
  ["pick/cslc-stage.jpg", "Conference stage", "National launch-sector talks that connect students to industry.", ""],
  ["pick/seneca-display-alt.jpg", "Campus rockets", "Display hardware and crew outside Seneca for outreach.", "feature"],
  ["pick/airframe-carry.jpg", "Airframe work", "Hands-on structural work outdoors with faculty and students.", ""],
  ["pick/flight-data.jpg", "Flight data", "Telemetry logs and range gear during a field session.", ""],
  ["pick/outreach-group.jpg", "Club fair", "Students discovering Astra Labs at a campus recruitment fair.", ""],
  ["pick/ground-equipment.jpg", "Range instruments", "Close-up of launch-day measurement and support hardware.", ""],
  ["pick/range-launch-canada.jpg", "Launch Canada ops", "Tents, teams, and vehicles on the active range.", "wide"],
] as const;
