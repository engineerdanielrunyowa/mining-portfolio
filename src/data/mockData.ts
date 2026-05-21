import type { Profile, Post, Skill, Project } from '../types';

export const mockProfile: Profile = {
  Name: 'James Thornton',
  Title: 'Senior Mining Engineer',
  Tagline: 'Driving efficiency and safety in open-pit and underground operations — from blast design to slope stability analysis.',
  ProfileImageURL: '/images/profile.jpg',
  LandingBackgroundURL: '/images/hero-bg.jpg',
  Phone: '+1 (555) 234-5678',
  Email: 'james.thornton@miningpro.com',
  Bio: `With over 15 years of hands-on experience across open-pit, underground, and quarry operations on three continents, I bring a data-driven, safety-first approach to every project I lead.

My core expertise spans blast design and execution, rock mechanics, slope stability analysis, and production optimisation. I have designed and supervised blasting programmes for operations processing up to 80,000 tonnes per day, achieving fragmentation targets while consistently reducing vibration impact on surrounding communities.

I hold a Bachelor of Engineering (Mining) with First Class Honours from the University of Queensland, and a Master of Science in Geomechanics from the Colorado School of Mines. I am a Registered Professional Engineer (RPEng) and a member of the Australasian Institute of Mining and Metallurgy (AusIMM).

Throughout my career I have led multidisciplinary teams, managed contractor relationships, and delivered technical reports for project bankability studies. I am equally comfortable presenting findings to a board of directors and standing on the pit floor guiding a crew through a complex pre-split blast.

Currently based in Perth, Western Australia, I am available for consulting engagements, full-time roles, and advisory positions in the resources sector.`,
  LinkedIn_URL: 'https://linkedin.com',
  Facebook_URL: 'https://facebook.com',
  Instagram_URL: 'https://instagram.com',
  X_URL: 'https://x.com',
  Threads_URL: 'https://threads.net',
  WhatsApp_URL: 'https://wa.me/15552345678',
  Show_LinkedIn: true,
  Show_Facebook: false,
  Show_Instagram: true,
  Show_X: true,
  Show_Threads: false,
  Show_WhatsApp: true,
  CV_File_URL: '#',
  CV_File_Name: 'James_Thornton_Mining_Engineer_CV.pdf',
};

export const mockPosts: Post[] = [
  {
    ID: '001',
    Timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    TextContent: `Completed a slope stability review for a major copper operation in South America this week. The DEM analysis revealed a potential failure plane at the 780mRL bench — we've recommended a revised inter-ramp angle of 38° with enhanced piezometer monitoring. 

The integration of LiDAR survey data into our Slide2 model gave us confidence levels we simply couldn't achieve with traditional methods five years ago. Technology adoption in geotechnical practice is transforming how we manage pit wall risk.

Proud of the team's rigorous work under a tight timeline. Delivering bankable geotechnical assessments is what we do best.`,
    ImageURLs: ['/images/project1.jpg'],
    VideoURLs: [],
    ThumbnailURL: '/images/project1.jpg',
  },
  {
    ID: '002',
    Timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    TextContent: `A common misconception in blast design: bigger holes = better fragmentation. In reality, the powder factor, burden-to-spacing ratio, and initiation timing have far greater influence on the fragmentation distribution than hole diameter alone.

At a granite quarry we consulted for last quarter, simply optimising the firing sequence — switching from row-by-row to echelon initiation with 42ms inter-hole delays — reduced oversize (+800mm) material by 34%, cutting crusher downtime significantly.

The fundamentals still matter more than the equipment.`,
    ImageURLs: [],
    VideoURLs: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
  },
  {
    ID: '003',
    Timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    TextContent: `Keynote delivered at the AusIMM Open Pit Operators Conference — "Data-Driven Blast Optimisation: From Drill Monitoring to Fragmentation Analytics." 

Key takeaways shared with the audience:
→ MWD (Measurement While Drilling) data is consistently underutilised in small to mid-tier operations
→ AI-assisted fragmentation analysis from face imagery is now production-ready and cost-effective
→ Vibration modelling has advanced significantly — we can now predict PPV to within ±15% on complex sites

Grateful for the opportunity to contribute to the ongoing conversation in our industry. Slides available on request.`,
    ImageURLs: ['/images/project2.jpg', '/images/hero-bg.jpg'],
    VideoURLs: [],
  },
];

export const mockSkills: Skill[] = [
  {
    ID: 's1', Order: 1, Title: 'Blast Design', Visible: true,
    Description: 'End-to-end blast design including pattern layout, explosive selection, delay sequencing, and post-blast fragmentation analysis.',
    IconURL: '',
  },
  {
    ID: 's2', Order: 2, Title: 'Slope Stability Analysis', Visible: true,
    Description: 'Kinematic analysis, limit equilibrium modelling (Slide2/Slope/W), and probabilistic risk assessment for open-pit and underground excavations.',
    IconURL: '',
  },
  {
    ID: 's3', Order: 3, Title: 'Rock Mechanics', Visible: true,
    Description: 'Geotechnical mapping, rock mass classification (RMR, Q-system, GSI), and numerical modelling using FLAC3D and Phase2.',
    IconURL: '',
  },
  {
    ID: 's4', Order: 4, Title: 'Production Optimisation', Visible: true,
    Description: 'Fleet management, drill & blast cycle optimisation, and throughput maximisation for large-scale open-pit operations.',
    IconURL: '',
  },
  {
    ID: 's5', Order: 5, Title: 'Mine Planning', Visible: true,
    Description: 'Strategic and operational mine planning using Whittle, MineSight, and Deswik, including pit shell optimisation and LOM scheduling.',
    IconURL: '',
  },
  {
    ID: 's6', Order: 6, Title: 'Ventilation Design', Visible: true,
    Description: 'Underground ventilation network design, airflow modelling, and compliance with dust and gas exposure standards.',
    IconURL: '',
  },
  {
    ID: 's7', Order: 7, Title: 'Geotechnical Drilling', Visible: true,
    Description: 'Supervision of RC, diamond core, and sonic drilling programmes with core logging, QAQC, and laboratory test coordination.',
    IconURL: '',
  },
  {
    ID: 's8', Order: 8, Title: 'Regulatory Compliance', Visible: true,
    Description: 'Preparation of mining proposals, ESMPs, and safety management plans for submission to state and federal regulators in Australia and internationally.',
    IconURL: '',
  },
];

export const mockProjects: Project[] = [
  {
    ID: 'p1', Order: 1, Visible: true,
    Title: 'Kalgoorlie Open Pit Expansion — Blast Optimisation Programme',
    Description: `Led a 12-month blast optimisation programme for a major gold operation, achieving a 28% reduction in oversize material and saving approximately AUD 1.2M in downstream crushing costs annually.

Scope included redesigning the blast pattern geometry, introducing electronic detonation across the operation, and implementing a real-time fragmentation monitoring system using image analysis software.

Delivered crew training, updated the site blast management plan, and presented findings at the annual MINESAFE conference.`,
    Category: 'Open Pit',
    ImageURL: '/images/project1.jpg',
    StartDate: 'Mar 2022',
    EndDate: 'Feb 2023',
  },
  {
    ID: 'p2', Order: 2, Visible: true,
    Title: 'Pilbara Iron Ore — Geotechnical Risk Assessment',
    Description: `Conducted a comprehensive geotechnical risk assessment across a Tier 1 iron ore operation, covering 22km of active pit wall across three open pits.

Deliverables included an updated geotechnical domain model, revised inter-ramp angle recommendations, a slope monitoring strategy (radar, prism, piezometers), and a pit wall failure response plan.

Work was performed to bankable feasibility standard and used to support a USD 400M reserve upgrade.`,
    Category: 'Open Pit',
    ImageURL: '/images/hero-bg.jpg',
    StartDate: 'Jun 2021',
    EndDate: 'Dec 2021',
  },
  {
    ID: 'p3', Order: 3, Visible: true,
    Title: 'Mount Isa Underground — Ventilation Redesign',
    Description: `Designed a new primary ventilation circuit for a deep underground copper operation at 1,200m depth, responding to increased production rates exceeding the original ventilation capacity.

Modelled the existing network using VentSim, identified four critical bottlenecks, and designed a two-stage booster fan installation that increased airflow by 42% while reducing energy consumption by 18%.

Project delivered under budget and ahead of schedule, with zero production interruptions during installation.`,
    Category: 'Underground',
    ImageURL: '/images/project2.jpg',
    StartDate: 'Jan 2020',
    EndDate: 'Aug 2020',
  },
  {
    ID: 'p4', Order: 4, Visible: true,
    Title: 'Chile Copper — Pre-Feasibility Blast Design Consulting',
    Description: `Provided independent technical review and blast design consulting for a greenfield copper porphyry project in northern Chile at pre-feasibility study stage.

Assessed the proposed blast design parameters against the rock mass characterisation data, recommended design modifications, and produced a trial blast specification for inclusion in the PFS technical report.

Engagement delivered in Spanish and English; report accepted by the project's Independent Technical Expert.`,
    Category: 'Consulting',
    ImageURL: '/images/project1.jpg',
    StartDate: 'Sep 2023',
    EndDate: 'Dec 2023',
  },
];
