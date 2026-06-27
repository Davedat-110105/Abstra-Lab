"""Site copy and media lists for Astra Labs public pages."""

CLUB_EMAIL = 'astra.labs.engineers@gmail.com'
CLUB_SIGNUP_URL = (
    'https://clubs.ssfinc.ca/club_signup?group_type=&search=astra+labs'
    '&category_tags=&all_my_groups=all_groups&order=name_asc'
)

ENGINEERING_VALUES = [
    (
        'Reliability over complexity',
        'Flight-critical systems lean on proven commercial off-the-shelf hardware so the vehicle and payload survive the mission.',
    ),
    (
        'Safety without compromise',
        'Every member is a safety officer. Launch Canada and CAR codes are non-negotiable.',
    ),
    (
        'Radical transparency',
        'Subsystem leads share interfaces and decisions through one documented source of truth.',
    ),
    (
        'Redundancy as standard',
        'Recovery, logging, and critical paths are designed so one failure does not end the mission.',
    ),
    (
        'Documentation for the future',
        'Engineering is half technical and half logistics. We document so the next Seneca crew starts ahead of us.',
    ),
]

LEADERSHIP = [
    {
        'name': 'Saiprasad Dhodi',
        'role': 'President · Avionics & Payload Lead',
        'responsibility': 'Strategic direction, competition readiness, and cross-subsystem integration.',
    },
    {
        'name': 'Roger Lungsee',
        'role': 'Vice-President · Mechanical',
        'responsibility': 'Team operations, fabrication coordination, and technical support.',
    },
    {
        'name': 'Danielle Heron',
        'role': 'Treasurer',
        'responsibility': 'Club finances, sponsorship outreach, and budget stewardship.',
    },
]

FACULTY_SUPPORT = [
    'Sundar Manku',
    'Dieter Hastings',
    'David Jong',
    'Harry Maghera',
]

ORG_PARTNERS = [
    'Seneca Helix',
    'School of Information Technology Administration & Security',
]

DISCIPLINES = [
    'Aerodynamics',
    'Structural analysis',
    'Propulsion',
    'Electronics',
    'Control systems',
    'Safety protocols',
    'Project management',
    'Manufacturing',
    'CAD design',
]

PROGRAMS = ['EEN', 'EET', 'EMA', 'MIT', 'ECT', 'Management', 'Marketing', 'Sponsorship']

COLLABORATIONS = [
    (
        'York University',
        'Cross-institutional rocketry partnership — shared test culture and launch-day coordination.',
    ),
    (
        'Seneca Developers Club',
        'Joint picosatellite workshop series — 50 students building CanSat-style payloads in teams.',
    ),
]

# (filename under static/images/field/, title, caption, layout modifier)
FIELD_GALLERY = [
    ('field/team-rockets-2026.jpg', 'Crew with rockets', 'Astra Labs members outside Seneca with student-built display rockets.', 'feature'),
    ('field/cslc-panel-2026.jpg', 'Launch conference panel', 'Canadian Space Launch Conference session with industry and rocket builders.', ''),
    ('field/cslc-stage-2026.jpg', 'Conference stage', 'Astra Labs following national launch-sector talks and networking.', ''),
    ('field/cslc-museum-2026.jpg', 'Aviation museum floor', 'Aircraft and aerospace exhibits from the conference venue.', 'wide'),
    ('field/aerial-oct2025.jpg', 'Range landscape', 'Aerial view from the Ontario launch area — where Pioneer will eventually fly.', 'feature'),
    ('field/shop-session-01.jpg', 'Shop session', 'Hands-on build work with the crew on club hardware.', ''),
    ('field/rocket-prep-01.jpg', 'Vehicle prep', 'Airframe and recovery hardware staged before integration.', 'tall'),
    ('field/team-outdoor-01.jpg', 'Field day', 'The crew on site during an outdoor build and test session.', ''),
    ('field/assembly-01.jpg', 'Assembly bench', 'Students fitting subsystems and documenting handoffs.', ''),
    ('field/aerial-wide-01.jpg', 'Launch corridor', 'Open sky above the practice range — apogee target 2.8 km.', 'wide'),
    ('field/workshop-01.jpg', 'Workshop floor', 'Fabrication and integration work in progress.', ''),
    ('field/team-group-01.jpg', 'Crew on the pad', 'Astra Labs members during a field operations day.', ''),
    ('gal06.jpg', 'Campus recruitment', 'New students meeting the team and seeing how they can join the build.', ''),
    ('updates.jpg', 'Outreach board', 'Project updates and club materials shared at campus events.', 'wide'),
]

SPONSOR_GALLERY = [
    ('field/cslc-panel-2026.jpg', 'Launch sector network', 'Conference conversations connecting Astra Labs to Canada’s launch ecosystem.', 'feature'),
    ('field/team-rockets-2026.jpg', 'Student crew', 'Astra Labs members representing the club and Pioneer program at Seneca.', ''),
    ('gal11.jpg', 'Astra Labs crew', 'Students representing Pioneer and the Launch Canada campaign.', 'feature'),
    ('gal03.jpg', 'Vehicle display', 'Rocket hardware on display for students, partners, and supporters.', ''),
    ('gal07.jpg', 'Student build work', 'Members learning through hands-on fabrication and assembly.', ''),
    ('gal25.jpg', 'Launch Canada floor', 'Competition and outreach moments that connect the team to the wider rocketry community.', 'wide'),
    ('pic11.jpg', 'Range operations', 'Field setup and launch-day practice around real hardware.', ''),
    ('ssfclubev.jpg', 'Campus activation', 'Recruiting and outreach events that introduce new students to the program.', ''),
]

SPONSOR_PACKAGE = {
    'filename': 'docs/sponsorship-package-astra-labs.pdf',
    'title': 'Sponsorship Package',
    'summary': (
        'The full sponsor deck — goals, Pioneer vehicle overview, tier benefits, '
        'investment levels, and next steps. Download or view inline below.'
    ),
    'contact_email': 'astralabsengineering@gmail.com',
    'linkedin_url': 'https://www.linkedin.com/company/astra-labs-engineers/',
    'contents': [
        'Goals and objectives',
        'Project and competition details',
        'Pioneer vehicle overview',
        'Benefits for sponsors',
        'Sponsorship tiers and investment',
        'Next steps and contacts',
    ],
}

SPONSOR_GOALS = [
    ('Educational outreach', 'Hands-on workshops and payload programs that bring new Seneca students into aerospace work.'),
    ('Program communications', 'Documented build logs, media, and milestone updates sponsors can follow and share.'),
    ('Competition participation', 'Launch Canada Challenge readiness — from bench tests to range operations.'),
    ('Certification achievements', 'Safety codes, ground testing, and competition compliance as measurable milestones.'),
]

SPONSOR_TIERS = [
    (
        'Bronze',
        '$500+',
        [
            'Logo on team website and social media posts',
            'Acknowledgment in YouTube Shorts credits',
            'Access to team resume book for recruitment',
        ],
    ),
    (
        'Silver',
        '$1,500+',
        [
            'All Bronze benefits',
            'Dedicated social media shoutout and video mention',
            'Invitation to campus launch demos',
        ],
    ),
    (
        'Gold',
        '$3,500+',
        [
            'All Silver benefits',
            'Priority access for company info sessions or workshops',
            'Custom thank-you video',
        ],
    ),
    (
        'Honour',
        '$4,000+',
        [
            'All Gold benefits',
            'Exclusive recruitment event or team presentation',
            'Model rocket replica',
        ],
    ),
]

SPONSOR_FUNDING_AREAS = [
    (
        'Vehicle & payload',
        'Airframe materials, recovery hardware, avionics boards, fasteners, and picosatellite workshop kits for student payloads.',
    ),
    (
        'Fabrication & test',
        'Shop tooling, measurement gear, ground-test fixtures, and safe integration supplies for bench validation.',
    ),
    (
        'Competition readiness',
        'Launch Canada registration, range operations support, and student travel so the team can prove the vehicle in competition.',
    ),
    (
        'Education & outreach',
        'Workshop consumables, club events, and recruitment so new Seneca students can join without prior aerospace experience.',
    ),
]

SPONSOR_PARTNER_VALUE = [
    (
        'Visibility',
        'Recognition on the website, event materials, and the student-built vehicle where competition rules allow.',
    ),
    (
        'Talent pipeline',
        'Meet students practicing CAD, KiCad, embedded firmware, fabrication, sponsorship, and technical documentation.',
    ),
    (
        'Evidence',
        'Progress reports through build logs, photo updates, and milestone summaries throughout the season.',
    ),
    (
        'Legacy',
        'Support leaves a permanent technical foundation at Seneca Polytechnic for crews after Launch Canada 2026.',
    ),
]

WORKSHOP_PUBLIC = {
    'title': 'Picosatellite workshop series',
    'summary': (
        'Astra Labs and Seneca Developers Club run a seven-week CanSat-style workshop '
        'for ~50 students — teams of four to six build, code, and test picosatellite payloads '
        'that feed directly into Pioneer\'s rideshare simulation.'
    ),
    'highlights': [
        ('50 students', 'Teams of 4–6 across software, hardware, data, structures, and mission science roles.'),
        ('7 sessions', 'From kit intro through sensors, telemetry, soldering, and a real drop test.'),
        ('Mission link', 'Workshop payloads practice the same rideshare interfaces Pioneer will fly at Launch Canada.'),
    ],
}

PROJECT_DESTINATIONS = [
    (
        '01',
        'Payload rideshare',
        'Fifty student-designed picosatellites in a suborbital rideshare simulation — the commercial launch model, at college scale.',
    ),
    (
        '02',
        'Vehicle integration',
        'Airframe, recovery, avionics, and operations converging on one launch-ready Pioneer configuration.',
    ),
    (
        '03',
        'Ground station',
        'Telemetry capture and authenticated flight records through the club ground-station system.',
    ),
    (
        '04',
        'Launch Canada 2026',
        'Team 06 moving from bench tests and documentation to competition readiness on the range.',
    ),
]
