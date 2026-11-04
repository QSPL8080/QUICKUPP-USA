export interface CaseStudyStat {
  val: string;
  lbl: string;
}

export interface CaseStudyStrategyStep {
  title: string;
  desc: string;
}

export interface CaseStudyItem {
  slug: string;
  title: string;
  client: string;
  location: string;
  industry: string;
  category: string;
  tag: string;
  timeline: string;
  desc: string;
  highlight: string;
  img: string;
  metrics: CaseStudyStat[];
  services: string[];
  challenge: {
    heading: string;
    paragraphs: string[];
  };
  whatWeDid: {
    heading: string;
    summary: string;
    steps: CaseStudyStrategyStep[];
  };
  results: {
    heading: string;
    paragraphs: string[];
  };
  whatsNext: {
    heading: string;
    paragraphs: string[];
  };
  dataSources: string;
}

export const CASE_STUDIES: CaseStudyItem[] = [
  {
    "slug": "neighbors-emergency-center",
    "title": "9,196 Patient Calls in 60 Days Across 9 Texas Emergency Centers",
    "client": "Neighbors Emergency Center",
    "location": "Amarillo, Baytown, Crosby, Kingwood, Livingston, Lubbock, Pasadena, Pearland, Porter (TX)",
    "industry": "Emergency Healthcare",
    "category": "Healthcare & Emergency Care",
    "tag": "HEALTHCARE • MULTI-LOCATION EMERGENCY CARE",
    "timeline": "60-Day Sprint (Aug 11 – Oct 9, 2026)",
    "desc": "Operates freestanding emergency rooms across Texas, from the Houston area to Amarillo and Lubbock. We engineered a unified performance engine combining Google Ads, Google Business Profiles, local SEO, and call tracking as one system—delivering 9,196 patient calls and 3,805 verified conversions in 60 days.",
    "highlight": "9,196 Patient Calls",
    "img": "/images/blog-img-01.jpg",
    "metrics": [
      {
        "val": "9,196",
        "lbl": "Tracked Patient Calls"
      },
      {
        "val": "95%",
        "lbl": "Call Answer Rate"
      },
      {
        "val": "3,805",
        "lbl": "Google Ads Conversions"
      },
      {
        "val": "80",
        "lbl": "Keywords at #1 on Google"
      }
    ],
    "services": [
      "Google Ads",
      "Google Business Profile",
      "Healthcare SEO",
      "Call Tracking"
    ],
    "challenge": {
      "heading": "Winning Emergency Discovery Across 9 Distinct Texas Markets",
      "paragraphs": [
        "In a medical emergency, patients search on their phones, evaluate the top two or three local options, and immediately call or navigate to the nearest facility.",
        "Neighbors Emergency Center competes against hospital conglomerates and other freestanding ERs in very different markets—from dense Houston suburbs to West Texas cities like Amarillo and Lubbock. Each facility needed to achieve local search supremacy and maintain an uncompromised call-answer rate.",
        "Before our intervention, several locations struggled with inefficient ad spend, fragmented profile management, and unmonitored call drop-offs during peak emergency hours."
      ]
    },
    "whatWeDid": {
      "heading": "Ads, Maps, Search, and 24/7 Call Routing Operating as One System",
      "summary": "We united performance advertising, organic map visibility, and real-time call tracking into an omnichannel patient acquisition machine.",
      "steps": [
        {
          "title": "Hyper-Localized Google Ads Campaigns",
          "desc": "Built independent, geo-fenced search ad campaigns for each ER facility, aggressively bidding on high-urgency keywords ('emergency room near me', 'ER open now', pediatric symptoms) and optimizing strictly for phone calls."
        },
        {
          "title": "Google Business Profile Network Optimization",
          "desc": "Synchronized all 9 location profiles with accurate operating hours, emergency amenities, rapid review response protocols, and dedicated tracking numbers."
        },
        {
          "title": "Symptom & Treatment Local SEO",
          "desc": "Engineered hundreds of localized clinical service pages targeting acute symptoms (chest pain, trauma, fractures, fever), ranking for over 300 tracked keywords across Texas."
        },
        {
          "title": "Real-Time Call Tracking & Attribution",
          "desc": "Tied every inbound call directly to its keyword and campaign source, tracking hourly answer rates to ensure staffing matched call volume spikes."
        }
      ]
    },
    "results": {
      "heading": "More Than 150 Inbound Patient Calls Every Day",
      "paragraphs": [
        "Across the 60-day tracking window, the nine emergency centers handled 9,196 verified patient calls, answering 95% of them. Over 5,972 of these were first-time prospective patients seeking urgent care.",
        "Google Ads generated 3,805 direct patient conversions at an average cost of $23.01 per patient. Organic search and Google Maps profiles produced an additional 90,130 search clicks at an average Google position of 6.9.",
        "Neighbors achieved #1 rankings for 'emergency room near me' across Pearland, Baytown, Pasadena, and Livingston, with 80 total keywords securing the coveted #1 organic spot."
      ]
    },
    "whatsNext": {
      "heading": "Expanding Suburb Dominance and Lowering Patient Acquisition Costs",
      "paragraphs": [
        "The ongoing optimization focuses on core 'emergency room' rankings in Porter and Kingwood, while bringing patient acquisition costs in Crosby and Pearland into alignment with the network's top-performing units."
      ]
    },
    "dataSources": "Data sources: Google Search Console, Google Ads Performance, Google Business Profile Insights, and CallRail verified call tracking logs (Aug 11 – Oct 9, 2026)."
  },
  {
    "slug": "exceptional-emergency-center",
    "title": "6,532 Patient Calls in 60 Days Across Seven Texas Emergency Rooms",
    "client": "Exceptional Emergency Center",
    "location": "Amarillo (2), Beaumont, Fort Worth, Orange, Port Arthur, Tyler (TX)",
    "industry": "Emergency Healthcare",
    "category": "Healthcare & Emergency Care",
    "tag": "HEALTHCARE • MULTI-LOCATION EMERGENCY CARE",
    "timeline": "60-Day Sprint (Aug 11 – Oct 9, 2026)",
    "desc": "For seven active 24/7 ER locations across Amarillo, Beaumont, Fort Worth, Orange, Port Arthur, and Tyler, we ran synchronized Google Ads, GBP optimization, and local search to win emergency discovery.",
    "highlight": "6,532 Patient Calls",
    "img": "/images/contact-boardroom.jpg",
    "metrics": [
      {
        "val": "6,532",
        "lbl": "Patient Phone Calls"
      },
      {
        "val": "94%",
        "lbl": "Calls Answered"
      },
      {
        "val": "3,178",
        "lbl": "Google Ads Conversions"
      },
      {
        "val": "100",
        "lbl": "Keywords in Google Top 3"
      }
    ],
    "services": [
      "Google Ads",
      "GBP Management",
      "Local ER SEO",
      "Call Tracking"
    ],
    "challenge": {
      "heading": "Being the First Emergency Facility People Find and Call",
      "paragraphs": [
        "In an emergency, people search, choose one of the first results, and call or drive there immediately. For a group of freestanding ERs spread across very different Texas markets—from the Panhandle to the Gulf Coast and DFW—each location must dominate its local search radius.",
        "Several locations previously suffered from low map pack visibility and inconsistent ad performance, causing high-value emergency patient flow to divert to regional hospital ERs."
      ]
    },
    "whatWeDid": {
      "heading": "Coordinated Ads, Maps, and Emergency Search Dominance",
      "summary": "Deployed a centralized patient acquisition architecture customized for the competitive dynamics of each individual Texas city.",
      "steps": [
        {
          "title": "Location-Specific Google Ads",
          "desc": "Deployed targeted ad groups across all seven facilities, capturing urgent queries with click-to-call extensions and location assets."
        },
        {
          "title": "Google Business Profile Scaling",
          "desc": "Maintained accurate emergency details, photo updates, and review velocity across all 7 verified profiles."
        },
        {
          "title": "Symptom & Urgent Care SEO",
          "desc": "Built clinical content targeting adult and pediatric emergencies, CT scan availability, and rapid lab turnaround times."
        },
        {
          "title": "Call Quality Monitoring",
          "desc": "Implemented dynamic number insertion to measure lead quality and ensure reception desks maintained rapid response rates."
        }
      ]
    },
    "results": {
      "heading": "6,532 Patient Calls and 3,178 Paid Search Conversions",
      "paragraphs": [
        "In 60 days, Exceptional Emergency Center logged 6,532 patient phone calls across all locations, with 4,394 originating from first-time callers.",
        "Google Ads generated 3,178 patient conversions at an average cost of $28.77 per patient, with an exceptional 16% conversion rate.",
        "Organic Google Search generated 30,105 high-intent clicks at an average ranking position of 6.5, with 100 keywords ranking in Google's top 3."
      ]
    },
    "whatsNext": {
      "heading": "Expanding Regional Share in DFW and East Texas",
      "paragraphs": [
        "Ongoing campaigns focus on expanding map coverage across competitive Fort Worth corridors and scaling pediatric symptom campaigns in Tyler and Beaumont."
      ]
    },
    "dataSources": "Data sources: Google Ads Performance Reports, Google Business Profile Insights, and CallRail call logs (Aug 11 – Oct 9, 2026)."
  },
  {
    "slug": "stat-specialty-hospital",
    "title": "4,405 Patient Calls in 60 Days & #1 for “Emergency Room Near Me” Across South Texas",
    "client": "STAT Specialty Hospital",
    "location": "Laredo North, Laredo South, Eagle Pass, Del Rio (TX)",
    "industry": "Emergency Healthcare",
    "category": "Healthcare & Emergency Care",
    "tag": "HEALTHCARE • MULTI-LOCATION EMERGENCY CARE",
    "timeline": "60-Day Sprint (Aug 11 – Oct 9, 2026)",
    "desc": "Serving South Texas border communities across Laredo (North & South), Eagle Pass, and Del Rio with targeted bilingual search campaigns, Google Ads, and local GBP authority.",
    "highlight": "4,405 Patient Calls",
    "img": "/images/contact-team-conference.jpg",
    "metrics": [
      {
        "val": "4,405",
        "lbl": "Tracked Patient Calls"
      },
      {
        "val": "94%",
        "lbl": "Call Answer Rate"
      },
      {
        "val": "#1",
        "lbl": "ER Near Me Ranking"
      },
      {
        "val": "1,864",
        "lbl": "Google Ads Conversions"
      }
    ],
    "services": [
      "Google Ads",
      "Local SEO",
      "GBP Optimization",
      "Call Tracking"
    ],
    "challenge": {
      "heading": "Owning Emergency Search in Fast-Growing Border Markets",
      "paragraphs": [
        "Laredo, Eagle Pass, and Del Rio are close-knit border communities where patients seeking emergency care choose between only a handful of facilities. Being the undisputed first result in English and Spanish determines patient destination.",
        "In late 2025, STAT ranked #7 for 'emergency room near me' in Laredo and was virtually unranked for acute symptom searches like abdominal pain, allergic reactions, and pediatric emergencies."
      ]
    },
    "whatWeDid": {
      "heading": "Bilingual Emergency Strategy Across Four Facilities",
      "summary": "Integrated bilingual paid search, localized symptom pages, and Google Maps optimization tailored to border market demographics.",
      "steps": [
        {
          "title": "Bilingual Search Ad Campaigns",
          "desc": "Structured dual English and Spanish ad campaigns targeting emergency and urgent medical terms across South Texas."
        },
        {
          "title": "Maps Dominance for 'ER Near Me'",
          "desc": "Optimized Google Business Profiles for Laredo North, Laredo South, Eagle Pass, and Del Rio to claim top map pack real estate."
        },
        {
          "title": "Specialty & Pediatric Landing Pages",
          "desc": "Created dedicated treatment pages highlighting outpatient observation, 24/7 imaging, and pediatric trauma care."
        },
        {
          "title": "24/7 Call Center Integration",
          "desc": "Tracked all call durations and sources, helping facility administrators verify patient intake numbers in real time."
        }
      ]
    },
    "results": {
      "heading": "4,405 Inbound Calls and Clean Sweep of #1 Rankings",
      "paragraphs": [
        "Across 60 days, STAT received 4,405 patient calls, with 2,471 coming from first-time callers. Facilities answered 94% of all calls.",
        "Google Ads delivered 1,864 patient conversions at $26.44 each, while organic search drove 61,702 clicks with an average position of 6.2.",
        "STAT captured the #1 position for 'emergency room near me' in Laredo, Eagle Pass, and Del Rio, holding 51 keywords at #1 and 75 in the top 3."
      ]
    },
    "whatsNext": {
      "heading": "Strengthening Specialty Care and Outpatient Visibility",
      "paragraphs": [
        "Continuing to expand visibility for scheduled specialty services, imaging appointments, and community health outreach across South Texas."
      ]
    },
    "dataSources": "Data sources: Google Ads, Google Business Profile Insights, and verified call tracking logs."
  },
  {
    "slug": "altus-emergency-centers",
    "title": "3,145 Patient Calls in 60 Days Across Three Texas ERs & 43% Lower Cost Per Click",
    "client": "Altus Emergency Centers",
    "location": "Lake Jackson, Lumberton, and Waxahachie, TX",
    "industry": "Emergency Healthcare",
    "category": "Healthcare & Emergency Care",
    "tag": "HEALTHCARE • MULTI-LOCATION EMERGENCY CARE",
    "timeline": "60-Day Sprint (Aug 11 – Oct 9, 2026)",
    "desc": "Operates freestanding emergency rooms in Lake Jackson, Lumberton, and Waxahachie. Replaced fragmented marketing with unified local SEO, Google Ads, and call tracking to capture high-intent patients.",
    "highlight": "3,145 Patient Calls",
    "img": "/images/contact-consultation-team.jpg",
    "metrics": [
      {
        "val": "3,145",
        "lbl": "Tracked Patient Calls"
      },
      {
        "val": "94%",
        "lbl": "Calls Answered"
      },
      {
        "val": "−43%",
        "lbl": "Google Ads Cost/Click"
      },
      {
        "val": "1,182",
        "lbl": "Paid Conversions"
      }
    ],
    "services": [
      "Local SEO",
      "Google Business Profile",
      "Google Ads",
      "Call Tracking"
    ],
    "challenge": {
      "heading": "Navigating High Ad Costs and Competitive Suburb ER Markets",
      "paragraphs": [
        "Altus Emergency Centers operates in distinct suburban regions: Brazoria County (Lake Jackson), Southeast Texas (Lumberton), and Greater Dallas-Fort Worth (Waxahachie). Each market had fierce competitors inflating Google Ads click costs.",
        "Altus needed to reduce acquisition costs while ensuring patient call volumes continued to climb."
      ]
    },
    "whatWeDid": {
      "heading": "Ad Budget Efficiency Paired with Aggressive Maps Expansion",
      "summary": "Refined keyword targeting to weed out non-emergency wasted spend, while boosting organic local map pack visibility.",
      "steps": [
        {
          "title": "Negative Keyword Pruning",
          "desc": "Eliminated thousands of dollars in wasted ad spend on generic hospital queries, focusing solely on immediate emergency demand."
        },
        {
          "title": "Local Map Pack Optimization",
          "desc": "Optimized categories, geotagged assets, and patient reviews across Lake Jackson, Lumberton, and Waxahachie profiles."
        },
        {
          "title": "High-Converting Mobile Funnels",
          "desc": "Streamlined mobile landing pages with one-touch calling, live wait time indicators, and insurance verification info."
        },
        {
          "title": "Intake Call Auditing",
          "desc": "Monitored answered call ratios across all shifts, ensuring incoming patient calls were answered within 3 rings."
        }
      ]
    },
    "results": {
      "heading": "3,145 Calls and 43% Reduction in Cost Per Click",
      "paragraphs": [
        "Altus achieved 3,145 patient phone calls in 60 days, with 2,063 from first-time callers. Facilities maintained a 94% answer rate.",
        "Google Ads delivered 1,182 conversions at $24.79 each, slashing average cost per click by 43% compared to the previous year.",
        "Achieved #1 Google rankings for 'emergency room near me' in Lumberton and Waxahachie, with 32 keywords ranking #1 and 59 in the top 3."
      ]
    },
    "whatsNext": {
      "heading": "Scaling Local Brand Awareness and Employer Care Networks",
      "paragraphs": [
        "Expanding direct partnerships with local employers and emergency medical services, supported by targeted digital outreach."
      ]
    },
    "dataSources": "Data sources: Google Ads, Google Search Console, GBP Insights, and call tracking metrics."
  },
  {
    "slug": "st-michaels-elite-hospital",
    "title": "From Invisible to Page One for “Emergency Room” & Direction Requests Up 112%",
    "client": "St. Michael’s Elite Hospital",
    "location": "Sugar Land / Houston, TX",
    "industry": "Hospital & Emergency Care",
    "category": "Healthcare & Emergency Care",
    "tag": "HEALTHCARE • EMERGENCY HOSPITAL",
    "timeline": "Year-Over-Year Surge",
    "desc": "Positioned a premier 24-hour emergency hospital in Sugar Land/Houston at #7 on Google from outside the top 100, driving massive year-over-year increases in patient visits and direction requests.",
    "highlight": "+112% Direction Requests",
    "img": "/images/contact-meeting-room.jpg",
    "metrics": [
      {
        "val": "+112%",
        "lbl": "Direction Requests YoY"
      },
      {
        "val": "843",
        "lbl": "Patient Calls (60 Days)"
      },
      {
        "val": "#7",
        "lbl": "\"Emergency Room\" Rank"
      },
      {
        "val": "+57%",
        "lbl": "Profile Interactions"
      }
    ],
    "services": [
      "Hospital SEO",
      "GBP Management",
      "Google Ads",
      "Call Tracking"
    ],
    "challenge": {
      "heading": "Breaking Through Against Entrenched Houston Hospital Systems",
      "paragraphs": [
        "Greater Houston is home to some of the world's largest hospital networks. For an independent luxury emergency hospital in Sugar Land, competing on general search terms was an uphill battle.",
        "In late 2025, the hospital did not rank in Google's top 100 for 'emergency room', 'emergency room near me', or 'hospital emergency room'."
      ]
    },
    "whatWeDid": {
      "heading": "Comprehensive Search, Maps, Ads, and Phone Integration",
      "summary": "Transformed an unranked hospital website into a first-page destination for local Sugar Land and Fort Bend County patients.",
      "steps": [
        {
          "title": "Clinical Service Page SEO",
          "desc": "Authored in-depth medical pages for 24-hour emergency care, low-dose CT imaging, 3T MRI diagnostics, and inpatient suites."
        },
        {
          "title": "Google Business Profile Revamp",
          "desc": "Revitalized the hospital's profile with verified attributes, high-resolution facility tours, and physician credentials."
        },
        {
          "title": "Targeted Paid Search Campaigns",
          "desc": "Deployed laser-targeted Google Ads to capture patients needing immediate emergency room treatment within a 7-mile radius."
        },
        {
          "title": "Call Intake Optimization",
          "desc": "Installed call tracking to trace inbound patient inquiries directly back to their originating search query."
        }
      ]
    },
    "results": {
      "heading": "Page One Rankings and 112% Surge in Direction Requests",
      "paragraphs": [
        "St. Michael’s climbed to #7 on Google for the ultra-competitive query 'emergency room', rising from outside the top 100.",
        "Physical driving direction requests surged by 112% year-over-year, and total Business Profile customer interactions climbed by 57%.",
        "The hospital logged 843 verified patient calls and 329 paid search conversions in 60 days, cementing its position in Sugar Land."
      ]
    },
    "whatsNext": {
      "heading": "Advancing Specialized Imaging and Inpatient Services",
      "paragraphs": [
        "Capitalizing on emergency gains to launch dedicated search funnels for physician-referred outpatient imaging and private surgical suites."
      ]
    },
    "dataSources": "Data sources: Google Search Console, Google Business Profile year-over-year analytics, and CallRail tracking."
  },
  {
    "slug": "kim-bruno-law",
    "title": "From Zero Rankings to 9 #1 Positions on Google & 1,368 Inbound Calls in 60 Days",
    "client": "Kim Bruno Law",
    "location": "Houston, TX",
    "industry": "Personal Injury Law",
    "category": "Legal & Law Firms",
    "tag": "LEGAL • BILINGUAL PERSONAL INJURY",
    "timeline": "9-Month Growth Sprint",
    "desc": "Built a dominant bilingual English & Spanish search presence across Greater Houston for wrongful death and vehicle accident cases, outcompeting mega-budget personal injury advertisers.",
    "highlight": "9 #1 Google Positions",
    "img": "/images/contact-professional-consultant.jpg",
    "metrics": [
      {
        "val": "9",
        "lbl": "#1 Google Rankings"
      },
      {
        "val": "1,368",
        "lbl": "Phone Calls (60 Days)"
      },
      {
        "val": "547K",
        "lbl": "Search Impressions"
      },
      {
        "val": "3:50",
        "lbl": "Average Call Duration"
      }
    ],
    "services": [
      "Bilingual Legal SEO",
      "City Practice Pages",
      "Google Business Profile",
      "Call Tracking"
    ],
    "challenge": {
      "heading": "Outmaneuvering Heavyweight Personal Injury Competitors",
      "paragraphs": [
        "Houston personal injury is one of the most expensive and fiercely contested legal markets in the United States, dominated by massive firms with multi-million-dollar billboard and TV budgets.",
        "In January 2026, Attorney Kim Bruno did not rank in Google's top 100 for any of the 94 tracked English or Spanish legal keywords."
      ]
    },
    "whatWeDid": {
      "heading": "High-Intent Bilingual Suburb and Practice Area Architecture",
      "summary": "Pioneered a culturally resonant bilingual SEO and local map pack strategy that captured accident victims throughout Houston suburbs.",
      "steps": [
        {
          "title": "Bilingual Practice Architecture",
          "desc": "Crafted parallel English and authentic Spanish content targeting auto, 18-wheeler, and wrongful death cases ('abogada de accidentes')."
        },
        {
          "title": "Houston Suburb Landing Pages",
          "desc": "Built targeted landing pages for affluent suburbs (Hunters Creek Village, Memorial, Spring Branch) where big firms lacked localized pages."
        },
        {
          "title": "Google Business Profile Authority",
          "desc": "Optimized the law firm profile to rank prominently in the local 3-pack for Spanish and English legal queries."
        },
        {
          "title": "Call Intake Tracking",
          "desc": "Integrated dynamic call tracking that revealed a remarkable 3:50 average call length, indicating high-intent case consultations."
        }
      ]
    },
    "results": {
      "heading": "9 #1 Google Rankings and 1,368 Prospective Client Calls",
      "paragraphs": [
        "The firm surged from zero rankings to 32 keywords in Google's top 100, 21 on page one, and 9 securing the absolute #1 ranking.",
        "Over the last 60 days, Kim Bruno Law logged 1,368 inbound phone calls, supported by over 547,000 organic Google Search impressions.",
        "Bilingual search capture successfully established the firm as a trusted household name for English and Spanish legal representation."
      ]
    },
    "whatsNext": {
      "heading": "Expanding Across Greater Texas Commercial Vehicle Corridors",
      "paragraphs": [
        "Scaling bilingual content hubs into the I-10 and I-45 freight corridors to capture complex commercial trucking accident cases."
      ]
    },
    "dataSources": "Data sources: Google Search Console, Google Business Profile Insights, and verified legal call tracking logs."
  },
  {
    "slug": "jlg-law",
    "title": "From 1 to 52 Ranking Keywords & 7 at #1 on Google in Ten Months",
    "client": "JLG Law",
    "location": "Houston, TX",
    "industry": "Criminal Defense Law",
    "category": "Legal & Law Firms",
    "tag": "LEGAL • CRIMINAL DEFENSE",
    "timeline": "10-Month Authority Sprint",
    "desc": "Engineered deep practice-area and suburb search architecture for a premier Houston criminal defense firm, generating #1 Google rankings for high-stakes federal and state defense inquiries.",
    "highlight": "52 Ranking Keywords",
    "img": "/images/blog-img-02.jpg",
    "metrics": [
      {
        "val": "1 → 52",
        "lbl": "Keywords in Top 100"
      },
      {
        "val": "7",
        "lbl": "#1 Google Rankings"
      },
      {
        "val": "28",
        "lbl": "Keywords on Page One"
      },
      {
        "val": "583K",
        "lbl": "Search Impressions"
      }
    ],
    "services": [
      "Criminal Defense SEO",
      "Practice Area Pages",
      "GBP Optimization",
      "Organic Search"
    ],
    "challenge": {
      "heading": "Gaining Visibility in a Crowded and Regulated Legal Niche",
      "paragraphs": [
        "Criminal defense search queries are heavily contested by hundreds of Houston law practices. General terms like 'criminal lawyer Houston' have sky-high competition.",
        "In November 2025, JLG Law ranked for only 1 tracked keyword in Google's top 100 and had virtually no organic search presence for its core federal and state practice areas."
      ]
    },
    "whatWeDid": {
      "heading": "Niche-Specific Federal and State Defense Architecture",
      "summary": "Constructed deep, authoritative legal content focused on specific criminal charges, federal court procedures, and suburban jurisdictions.",
      "steps": [
        {
          "title": "Specialized Charge Content Hubs",
          "desc": "Created exhaustive legal resources for weapons trafficking, conspiracy, money laundering, DWI defense, and federal forfeiture."
        },
        {
          "title": "Surrounding Suburb Pages",
          "desc": "Expanded reach into Katy, Sugar Land, The Woodlands, and Pasadena with localized court and defense information."
        },
        {
          "title": "E-E-A-T Authority Building",
          "desc": "Structured attorney bios, case summaries, and courtroom credentials to establish elite Google search trust signals."
        },
        {
          "title": "Google Business Profile Integration",
          "desc": "Optimized local map listings for urgent, after-hours arrest and bail hearing searches."
        }
      ]
    },
    "results": {
      "heading": "52 Keywords in Top 100, 28 on Page One, and 7 at #1",
      "paragraphs": [
        "In ten months, JLG Law scaled from 1 to 52 ranking keywords in Google's top 100, with 28 reaching page one and 7 holding the #1 position.",
        "Captured dominant #1 rankings for high-intent searches including 'weapon trafficking lawyer Houston' and related federal defense queries.",
        "Organic impressions reached 583,000 in 60 days, with 70% of all website traffic originating directly from Google organic search."
      ]
    },
    "whatsNext": {
      "heading": "Broadening Federal White-Collar Defense Dominance",
      "paragraphs": [
        "Launching comprehensive content silos for federal grand jury subpoenas, healthcare fraud defense, and appellate advocacy."
      ]
    },
    "dataSources": "Data sources: Google Search Console organic tracking and Google Business Profile insights."
  },
  {
    "slug": "lakhani-mcgrath",
    "title": "From Zero Rankings to 19 Page-One Positions on Google in Nine Months",
    "client": "Lakhani & McGrath",
    "location": "Houston, TX",
    "industry": "Personal Injury Law",
    "category": "Legal & Law Firms",
    "tag": "LEGAL • PERSONAL INJURY",
    "timeline": "9-Month Local Climb",
    "desc": "Established hyper-targeted suburb and case-type landing pages across Greater Houston, taking a personal injury firm from zero visibility to 19 page-one positions and 227K organic impressions.",
    "highlight": "19 Page-One Positions",
    "img": "/images/contact-corporate-consultation.jpg",
    "metrics": [
      {
        "val": "0 → 19",
        "lbl": "Page-1 Google Positions"
      },
      {
        "val": "227K",
        "lbl": "Search Impressions"
      },
      {
        "val": "78%",
        "lbl": "Organic Traffic Share"
      },
      {
        "val": "#5",
        "lbl": "Premises Liability Rank"
      }
    ],
    "services": [
      "Personal Injury SEO",
      "Case-Type Pages",
      "Google Business Profile",
      "Rank Tracking"
    ],
    "challenge": {
      "heading": "Breaking into Houston Personal Injury Search Without a TV Budget",
      "paragraphs": [
        "Houston personal injury is dominated by billboard and media giants. For a growing firm, competing head-to-head on broad commercial keywords requires unsustainable ad budgets.",
        "In December 2025, Lakhani & McGrath did not rank in Google's top 100 for any of their 89 tracked keywords."
      ]
    },
    "whatWeDid": {
      "heading": "Winning the Suburbs and Specialized Case Types",
      "summary": "Adopted a surgical local SEO approach targeting specific communities and incident categories where large firms leave gaps.",
      "steps": [
        {
          "title": "Accident & Liability Case Silos",
          "desc": "Engineered detailed landing pages for 18-wheeler accidents, premises liability, rideshare collisions, and motorcycle crashes."
        },
        {
          "title": "Community Suburb Expansion",
          "desc": "Authored dedicated local pages for Spring, Cypress, Pearland, and Sugar Land residents."
        },
        {
          "title": "Technical SEO & Speed Optimization",
          "desc": "Optimized website performance, Core Web Vitals, and mobile responsiveness for instant consultation loading."
        },
        {
          "title": "Review & Map Pack Authority",
          "desc": "Built continuous review velocity on Google Business Profile to strengthen local pack inclusion."
        }
      ]
    },
    "results": {
      "heading": "19 Page-One Positions and 227K Search Impressions",
      "paragraphs": [
        "Within nine months, the firm reached 27 keywords in the top 100 and 19 on Google's first page, with 57 keywords reaching page one at least once.",
        "Achieved a #5 ranking for 'premises liability lawyer Houston' rising from completely unranked.",
        "Organic search now supplies 78% of all firm website traffic, generating over 227,000 search impressions in 60 days."
      ]
    },
    "whatsNext": {
      "heading": "Expanding Wrongful Death and Catastrophic Injury Silos",
      "paragraphs": [
        "Targeting high-damages litigation queries and expanding localized search coverage into Montgomery and Galveston counties."
      ]
    },
    "dataSources": "Data sources: Google Search Console, Google Analytics 4, and keyword rank tracking audits."
  },
  {
    "slug": "romero-injury-law",
    "title": "From Zero Rankings to Page One for Accident-Type Searches in Three Months",
    "client": "Romero Injury Law",
    "location": "Houston, TX",
    "industry": "Personal Injury Law",
    "category": "Legal & Law Firms",
    "tag": "LEGAL • MOTOR VEHICLE ACCIDENTS",
    "timeline": "90-Day Rapid Rank",
    "desc": "Targeted specific high-intent crash queries (T-bone, intersection, multi-vehicle) and Houston suburbs to rank a boutique injury firm on page one within 90 days of launch.",
    "highlight": "0 → 20 Top-100 Keywords",
    "img": "/images/contact-client-consultation.jpg",
    "metrics": [
      {
        "val": "0 → 20",
        "lbl": "Keywords in Top 100"
      },
      {
        "val": "#5",
        "lbl": "T-Bone Attorney Rank"
      },
      {
        "val": "143",
        "lbl": "Client Calls (60 Days)"
      },
      {
        "val": "87%",
        "lbl": "Calls Answered"
      }
    ],
    "services": [
      "Accident-Type SEO",
      "Suburb Expansion",
      "GBP Optimization",
      "Call Tracking"
    ],
    "challenge": {
      "heading": "Finding Lucrative Openings in a Heavyweight Legal Market",
      "paragraphs": [
        "Houston car accident searches are among the most congested in the nation. Large firms buy massive search volume, pricing smaller firms out of broad paid search.",
        "In January 2026, Romero Injury Law had zero rankings in Google's top 100 across 28 tracked vehicle accident phrases."
      ]
    },
    "whatWeDid": {
      "heading": "Focusing on How Injured Drivers Actually Search",
      "summary": "Identified high-conversion search phrases describing specific accident mechanics and localized suburban corridors.",
      "steps": [
        {
          "title": "Accident Mechanics Content",
          "desc": "Authored dedicated case pages for T-bone accidents, intersection collisions, sideswipe crashes, and rear-end impacts."
        },
        {
          "title": "West Houston Suburb Pages",
          "desc": "Created localized legal resources for Fulshear, Hedwig Village, Hunters Creek Village, and Manvel."
        },
        {
          "title": "Google Business Profile Setup",
          "desc": "Optimized the law office profile with verified legal categories, local schema markup, and call tracking."
        },
        {
          "title": "Rapid Lead Routing",
          "desc": "Connected web and phone leads to an instant notification system ensuring case intake calls were addressed immediately."
        }
      ]
    },
    "results": {
      "heading": "Fast Page-One Rankings and 143 Inbound Client Calls",
      "paragraphs": [
        "In just three months, Romero Injury Law propelled 20 keywords into Google's top 100, reaching page one for major accident queries.",
        "Ranked #5 on Google for 'T-bone accident attorney' and #5 for 'Fulshear car accident lawyer' in April 2026.",
        "Generated 143 verified client phone calls in 60 days (52 from first-time prospective clients), with an 87% answer rate."
      ]
    },
    "whatsNext": {
      "heading": "Building Out Highway and Commercial Corridor Content",
      "paragraphs": [
        "Extending coverage to major Houston transit arteries (I-10 West, Grand Parkway 99, Westpark Tollway) to capture commuter collision cases."
      ]
    },
    "dataSources": "Data sources: Google Search Console, keyword rank tracking, and CallRail inbound call logs."
  },
  {
    "slug": "madtax",
    "title": "11 City Bookkeeping Pages on Google's First Page Within a Month of Launch",
    "client": "MadTax",
    "location": "Houston, TX & Nationwide",
    "industry": "Bookkeeping & Tax Advisory",
    "category": "Finance & Professional",
    "tag": "FINANCE • BOOKKEEPING & TAX SERVICES",
    "timeline": "30-Day City Launch",
    "desc": "Constructed targeted city service pages across Houston and nationwide for a boutique bookkeeping and tax consultancy, capturing 11 first-page positions and 7 top-5 rankings in 30 days.",
    "highlight": "11 Page-1 Rankings",
    "img": "/images/contact-consulting-planning.jpg",
    "metrics": [
      {
        "val": "0 → 11",
        "lbl": "Page-1 City Keywords"
      },
      {
        "val": "1 → 23",
        "lbl": "Keywords in Top 100"
      },
      {
        "val": "#1",
        "lbl": "Sunrise Manor Rank"
      },
      {
        "val": "7",
        "lbl": "Keywords in Google Top 5"
      }
    ],
    "services": [
      "City Service Pages",
      "On-Page SEO",
      "Rank Tracking",
      "Local Search"
    ],
    "challenge": {
      "heading": "A Boutique Consultancy Competing with National Accounting Giants",
      "paragraphs": [
        "Small business bookkeeping search results are dominated by multi-billion-dollar accounting software platforms and national franchise networks.",
        "In January 2026, MadTax ranked in Google's top 100 for only 1 of 23 tracked city keywords, lacking organic visibility to attract local SMB clients."
      ]
    },
    "whatWeDid": {
      "heading": "A Dedicated High-Relevance Page for Every Target Market",
      "summary": "Capitalized on localized commercial searches where national software brands possess zero local landing pages.",
      "steps": [
        {
          "title": "Localized Bookkeeping Pages",
          "desc": "Engineered customized service pages for Houston suburbs (Texas City, Friendswood, Alvin, West University Place) and key national markets."
        },
        {
          "title": "SMB Search Intent Optimization",
          "desc": "Optimized title tags, schemas, and content around commercial phrases like 'monthly bookkeeping for small business' and 'business tax filing'."
        },
        {
          "title": "Interlinked Service Architecture",
          "desc": "Connected city pages through an intuitive regional taxonomy that distributed domain authority effectively."
        },
        {
          "title": "Weekly SERP Rank Tracking",
          "desc": "Monitored keyword movements weekly to make rapid on-page heading and meta tag adjustments."
        }
      ]
    },
    "results": {
      "heading": "11 Page-One Positions Within 30 Days of Launch",
      "paragraphs": [
        "Within one month of going live, 11 of the 23 tracked city keywords reached Google's first page, and 7 placed in the top 5.",
        "Captured #1 ranking for 'Sunrise Manor bookkeeping service', #3 for Texas City, #4 for Montpelier, and #5 for Friendswood.",
        "Total keywords in Google's top 100 jumped from 1 to 23, creating an immediate influx of small business client inquiries."
      ]
    },
    "whatsNext": {
      "heading": "Rolling Out City Pages Across 50 Additional US Markets",
      "paragraphs": [
        "Scaling the proven city-page architecture into high-growth SMB markets across Florida, Georgia, and North Carolina."
      ]
    },
    "dataSources": "Data sources: Google Search Console, Ahrefs keyword position tracking, and client intake reports."
  },
  {
    "slug": "ainsley-heights",
    "title": "Turning Local Search into 4,199 Renter Actions in 60 Days",
    "client": "Ainsley Heights",
    "location": "Houston, TX",
    "industry": "Multifamily Real Estate",
    "category": "Real Estate & Multifamily",
    "tag": "REAL ESTATE • MULTIFAMILY APARTMENTS",
    "timeline": "60-Day Renter Engine",
    "desc": "Managed local search and Google Business Profile for a premier Houston luxury apartment community, driving 1,915 physical direction requests and 4,199 total tenant interactions.",
    "highlight": "4,199 Renter Actions",
    "img": "/images/blog-img-04.jpg",
    "metrics": [
      {
        "val": "4,199",
        "lbl": "Renter Google Actions"
      },
      {
        "val": "31%",
        "lbl": "Action Conversion Rate"
      },
      {
        "val": "1,915",
        "lbl": "Direction Requests"
      },
      {
        "val": "2,308",
        "lbl": "Website Clicks from Search"
      }
    ],
    "services": [
      "Multifamily SEO",
      "Google Business Profile",
      "Website Search",
      "Local Listings"
    ],
    "challenge": {
      "heading": "Competing for Renters in America's Most Saturated Apartment Market",
      "paragraphs": [
        "Houston renters have hundreds of luxury apartment communities to choose from, and almost all begin their journey on Google with searches like '2 bedroom apartments Houston' or 'luxury apartments near me'.",
        "National apartment syndication directories (Apartments.com, Zillow) dominate search results, forcing individual communities to fight for direct renter discovery."
      ]
    },
    "whatWeDid": {
      "heading": "Transforming the Google Business Profile into a Tour-Booking Engine",
      "summary": "Maximized direct renter engagement through optimized Google Maps presence, floor plan showcases, and local neighborhood SEO.",
      "steps": [
        {
          "title": "Google Business Profile Dominance",
          "desc": "Updated unit floor plans, amenities, pet policies, and pricing tags, transforming the profile into an interactive digital brochure."
        },
        {
          "title": "Local Houston Neighborhood SEO",
          "desc": "Targeted commute-based searches highlighting proximity to major employers, medical hubs, and shopping districts."
        },
        {
          "title": "Tour-Booking CTA Integration",
          "desc": "Embedded seamless booking links directly within Google search results to allow prospective tenants to schedule walkthroughs in seconds."
        },
        {
          "title": "Review & Reputation Strategy",
          "desc": "Implemented automated resident review requests that built an immaculate 5-star Google reputation."
        }
      ]
    },
    "results": {
      "heading": "4,199 Renter Actions and a 31% Conversion Rate",
      "paragraphs": [
        "In 60 days, Ainsley Heights generated 4,199 total renter actions on Google (website visits, phone calls, and direction requests).",
        "Nearly 1 in 3 people (31%) who viewed the Business Profile took a direct conversion action, yielding 1,915 physical driving direction requests (up 21% YoY).",
        "Google Search drove 2,308 visits to the community website at a remarkable 17.9% click-through rate, keeping leasing occupancy at peak levels."
      ]
    },
    "whatsNext": {
      "heading": "Deploying Interactive Virtual Walkthroughs and Seasonal Specials",
      "paragraphs": [
        "Integrating 3D virtual tour experiences directly into the Google profile and launching seasonal leasing incentives for summer turnover."
      ]
    },
    "dataSources": "Data sources: Google Business Profile Performance Analytics and Google Search Console (Aug 11 – Oct 9, 2026)."
  },
  {
    "slug": "grandewood-pointe",
    "title": "4,798 Renter Actions on Google in 60 Days for Orlando Apartment Community",
    "client": "Grandewood Pointe",
    "location": "Orlando, FL",
    "industry": "Multifamily Real Estate",
    "category": "Real Estate & Multifamily",
    "tag": "REAL ESTATE • MULTIFAMILY APARTMENTS",
    "timeline": "60-Day Leasing Surge",
    "desc": "Elevated an Orlando multifamily apartment community above national listing portals, delivering 2,823 website visits and 1,576 direction requests from local Google Maps searches.",
    "highlight": "4,798 Renter Actions",
    "img": "/images/blog-img-03.jpg",
    "metrics": [
      {
        "val": "4,798",
        "lbl": "Renter Google Actions"
      },
      {
        "val": "2,823",
        "lbl": "Website Clicks from GBP"
      },
      {
        "val": "1,576",
        "lbl": "Direction Requests"
      },
      {
        "val": "21%",
        "lbl": "Action Conversion Rate"
      }
    ],
    "services": [
      "Apartment Community SEO",
      "GBP Management",
      "Website Search",
      "Tour Booking"
    ],
    "challenge": {
      "heading": "Standing Out in Orlando’s Fast-Paced Rental Market",
      "paragraphs": [
        "Orlando renters face an overwhelming supply of new apartment communities. Third-party listing aggregators consume massive organic real estate, charging hefty referral fees.",
        "Grandewood Pointe needed to drive direct, commission-free tour bookings and phone calls through their own Google presence."
      ]
    },
    "whatWeDid": {
      "heading": "Optimized Google Profile and Local Floor Plan Search Presence",
      "summary": "Turned the community's digital presence into an active tour pipeline capturing renters searching for 1, 2, and 3-bedroom Orlando homes.",
      "steps": [
        {
          "title": "Full Business Profile Optimization",
          "desc": "Showcased high-definition community photos, pool amenities, clubhouse features, and direct tour scheduling buttons."
        },
        {
          "title": "Unit-Type On-Page SEO",
          "desc": "Optimized website pages for 'apartments near me Orlando', '1 bedroom apartments', and pet-friendly rental phrases."
        },
        {
          "title": "Local Schema & Map Signals",
          "desc": "Deployed apartment complex structured data to ensure Google recognized all floor plans and leasing office hours."
        },
        {
          "title": "Engagement Tracking",
          "desc": "Monitored visitor engagement time and bounce rates to optimize the conversion path from Google to tour booking."
        }
      ]
    },
    "results": {
      "heading": "4,798 Total Renter Actions and 2,823 Website Clicks",
      "paragraphs": [
        "Over 60 days, Grandewood Pointe captured 4,798 renter actions on Google, with approximately 1 in 5 viewers taking immediate action.",
        "The Google profile drove 2,823 direct clicks to the community website and 1,576 driving direction requests from prospective renters.",
        "Website visitors maintained an average engagement time of 1:28 with an exceptionally low 34.7% bounce rate, keeping leasing units consistently filled."
      ]
    },
    "whatsNext": {
      "heading": "Expanding Corporate Relocation and Digital Lease Integration",
      "paragraphs": [
        "Targeting out-of-state relocation searches from professionals moving to Central Florida's growing tech and healthcare sectors."
      ]
    },
    "dataSources": "Data sources: Google Business Profile Insights and Google Analytics 4 engagement data (Aug 11 – Oct 9, 2026)."
  },
  {
    "slug": "erics-car-care",
    "title": "5,067 Customer Calls in 60 Days for Two Houston Auto Repair Shops",
    "client": "Eric’s Car Care",
    "location": "Med Center & Rice Village, Houston, TX",
    "industry": "Automotive Services",
    "category": "Local & Automotive Services",
    "tag": "AUTOMOTIVE • MULTI-LOCATION AUTO REPAIR",
    "timeline": "Omnichannel Auto Care",
    "desc": "Synchronized Google Ads, Local Services Ads (LSA), Business Profiles, and SEO across two Kirby Drive repair shops in Houston, capturing 5,067 customer calls with a 97% answer rate.",
    "highlight": "5,067 Customer Calls",
    "img": "/images/blog-img-06.jpg",
    "metrics": [
      {
        "val": "5,067",
        "lbl": "Tracked Customer Calls"
      },
      {
        "val": "97%",
        "lbl": "Calls Answered"
      },
      {
        "val": "1,402",
        "lbl": "Google Ads Conversions"
      },
      {
        "val": "1,278",
        "lbl": "Direction Requests"
      }
    ],
    "services": [
      "Google Ads",
      "Local Services Ads (LSA)",
      "GBP Optimization",
      "Auto Repair SEO"
    ],
    "challenge": {
      "heading": "Capturing Drivers with Urgent Breakdown and Maintenance Needs",
      "paragraphs": [
        "Drivers searching for auto repair in Houston typically have immediate, urgent needs (check engine lights, brake failure, AC breakdown). They call the first shop with stellar reviews and immediate proximity.",
        "Eric’s Car Care needed to dominate both paid Google search and organic local map packs across Kirby Drive, Rice Village, and the Texas Medical Center."
      ]
    },
    "whatWeDid": {
      "heading": "Google Ads, LSA, Maps, and Phone Routing Working Together",
      "summary": "Built a multi-channel acquisition funnel designed to catch drivers at the exact moment of mechanical need.",
      "steps": [
        {
          "title": "Google Local Services Ads (LSA)",
          "desc": "Secured Google Screened badges for both shops, capturing top-of-page real estate with pay-per-call pricing."
        },
        {
          "title": "High-Intent Google Ads",
          "desc": "Ran targeted campaigns on 'brake repair near me', 'car AC repair Houston', and emergency transmission diagnostics."
        },
        {
          "title": "Dual Business Profile Management",
          "desc": "Optimized two separate profiles along Kirby Drive, driving high review volumes and accurate operating hours."
        },
        {
          "title": "Call Intake Tracking",
          "desc": "Implemented call recording and routing systems that enabled shop managers to maintain a 97% answer rate."
        }
      ]
    },
    "results": {
      "heading": "5,067 Phone Calls and 1,402 Paid Conversions in 60 Days",
      "paragraphs": [
        "Over 60 days, Eric’s Car Care received 5,067 verified customer phone calls (2,856 from first-time callers), answering 97% of them.",
        "Google Ads produced 1,402 conversions at an efficient $26.33 per booked customer, while maintaining a low $1.68 cost per click.",
        "Google Business Profiles generated 1,278 in-person driving direction requests and climbed from #48 to #8 for 'car AC repair Houston'."
      ]
    },
    "whatsNext": {
      "heading": "Seasonal AC Tune-Up Campaigns and Hybrid/EV Service Expansion",
      "paragraphs": [
        "Launching targeted campaigns for hybrid vehicle battery maintenance and seasonal pre-summer cooling system inspections."
      ]
    },
    "dataSources": "Data sources: Google Ads, Google LSA dashboard, GBP Insights, and CallRail tracking (Aug 11 – Oct 9, 2026)."
  },
  {
    "slug": "afa-movers",
    "title": "Doubling the Area Where They Rank Top 3 in Google Maps in Four Months",
    "client": "AFA Movers",
    "location": "Sugar Land, TX (Houston Area)",
    "industry": "Moving & Logistics",
    "category": "Local & Automotive Services",
    "tag": "HOME SERVICES • MOVING & PACKING",
    "timeline": "4-Month Map-Pack Scale",
    "desc": "Expanded Google Maps top-3 radius from 31% to 64% of their 6-mile Sugar Land/Houston service territory, elevating commercial, residential, and piano moving queries into top positions.",
    "highlight": "2x Maps Top-3 Coverage",
    "img": "/images/contact-strategy-consultation.jpg",
    "metrics": [
      {
        "val": "2×",
        "lbl": "Top-3 Maps Coverage (64%)"
      },
      {
        "val": "93%",
        "lbl": "Local Top-10 Coverage"
      },
      {
        "val": "7.5 → 3.9",
        "lbl": "Avg Maps Rank Position"
      },
      {
        "val": "100%",
        "lbl": "Piano Movers Top-10"
      }
    ],
    "services": [
      "Maps Pack SEO",
      "Google Business Profile",
      "Grid Rank Tracking",
      "Local Relevance"
    ],
    "challenge": {
      "heading": "Breaking Out Beyond the Immediate Sugar Land Office Perimeter",
      "paragraphs": [
        "Moving is among the most aggressive local categories in Greater Houston. Consumers rarely scroll past the top three map-pack listings before contacting movers for quotes.",
        "AFA Movers ranked well immediately adjacent to its Sugar Land office, but visibility dropped to near-zero just a few miles out in southwest Houston.",
        "On high-volume searches like 'cheap movers', AFA appeared in the top 3 across just 2% of their service territory."
      ]
    },
    "whatWeDid": {
      "heading": "Multi-Point Geogrid Optimization and Service Authority",
      "summary": "Expanded local map authority across a 133-point geogrid covering a 6-mile radius surrounding southwest Houston.",
      "steps": [
        {
          "title": "Comprehensive GBP Optimization",
          "desc": "Configured specific service offerings: residential, commercial, furniture, piano, packing, and long-distance moves."
        },
        {
          "title": "Service-Led Content Silos",
          "desc": "Engineered detailed website landing pages addressing price-conscious ('cheap movers') and specialty queries ('piano moving')."
        },
        {
          "title": "Localized Citation Architecture",
          "desc": "Strengthened consistent NAP citations and location schema across all regional business directories."
        },
        {
          "title": "133-Point Geogrid Tracking",
          "desc": "Ran automated bi-weekly geogrid scans across 13 core moving keywords to pinpoint and elevate weak neighborhoods."
        }
      ]
    },
    "results": {
      "heading": "Top-3 Coverage Doubled from 31% to 64% Across the Entire Territory",
      "paragraphs": [
        "In four months, AFA Movers doubled its top-3 Google Maps coverage from 31% to 64% across its 6-mile service radius, while 93% of the grid placed AFA in the top 10.",
        "Average Google Maps ranking position improved from 7.5 to 3.9 across all 13 tracked moving keywords.",
        "'Cheap movers' top-3 coverage soared from 2% to 77%, commercial moving top-3 coverage hit 89%, and piano moving achieved 100% top-10 coverage."
      ]
    },
    "whatsNext": {
      "heading": "Extending Reach Across Fort Bend County and Long-Distance Routes",
      "paragraphs": [
        "Scaling geogrid dominance toward Katy and Richmond while creating dedicated interstate relocation content."
      ]
    },
    "dataSources": "Data sources: LocalFalcon 133-point geogrid scans, monthly keyword rank audits, and Google Business Profile activity reports."
  },
  {
    "slug": "eg-elite",
    "title": "From Invisible to the Google Maps Top 10 for New York Car Shipping Searches",
    "client": "E&G Elite",
    "location": "New York, NY",
    "industry": "Auto Transport & Logistics",
    "category": "Retail & Transport",
    "tag": "TRANSPORT • AUTO SHIPPING LOGISTICS",
    "timeline": "6-Month Grid Expansion",
    "desc": "Enabled a Manhattan-based vehicle transport carrier to outrank national broker aggregators, scaling top-10 Google Maps coverage from 0% to 59% across a 6-mile NYC grid.",
    "highlight": "0% → 59% Maps Top-10",
    "img": "/images/contact-tech-discussion.jpg",
    "metrics": [
      {
        "val": "0% → 59%",
        "lbl": "Maps Top-10 Coverage"
      },
      {
        "val": "77%",
        "lbl": "NYC Grid Top-10 Coverage"
      },
      {
        "val": "74%",
        "lbl": "Calls from Google Profile"
      },
      {
        "val": "13.5K",
        "lbl": "Search Impressions"
      }
    ],
    "services": [
      "Local SEO",
      "Google Business Profile",
      "Call Tracking",
      "Maps Grid Tracking"
    ],
    "challenge": {
      "heading": "Competing Against Massive National Broker Websites in NYC",
      "paragraphs": [
        "Car shipping search results are overwhelmed by nationwide lead-generation websites with huge advertising budgets. For an authentic New York-based carrier, competing on national generic terms is cost-prohibitive.",
        "E&G Elite needed to win local vehicle owners in Manhattan, Brooklyn, Queens, and North Jersey seeking trusted enclosed and open carriers nearby."
      ]
    },
    "whatWeDid": {
      "heading": "Establishing Local Trust and Map Pack Dominance in Manhattan",
      "summary": "Anchored the carrier's digital footprint around local New York car shipping intent and verified customer reviews.",
      "steps": [
        {
          "title": "Google Business Profile Architecture",
          "desc": "Optimized categories, commercial vehicle photos, service radii, and verified licensing info."
        },
        {
          "title": "Luxury & Exotic Vehicle Landing Pages",
          "desc": "Created dedicated service pages for enclosed classic, exotic, and high-value vehicle transport out of the Tri-State area."
        },
        {
          "title": "Tri-State Route Targeting",
          "desc": "Built localized route content for popular New York to Florida and New York to California transit lanes."
        },
        {
          "title": "Geogrid Rank Auditing",
          "desc": "Tracked map rankings across a dense 6-mile Manhattan and Brooklyn grid to pinpoint top-ranking neighborhoods."
        }
      ]
    },
    "results": {
      "heading": "59% Top-10 Coverage Across NYC and 74% Inbound Call Share",
      "paragraphs": [
        "Between January and June 2026, E&G Elite's top-10 Google Maps coverage for 'best car shipping company' grew from 0% to 59% across the NYC grid.",
        "For 'ship car to New York', 77% of the entire grid placed E&G in the top 10 local pack.",
        "Over 60 days, 74% of all high-value vehicle shipping quote phone calls came directly from the optimized Google Business Profile."
      ]
    },
    "whatsNext": {
      "heading": "Targeting Snowbird Seasonal Routes to South Florida",
      "paragraphs": [
        "Launching seasonal campaigns capturing seasonal New York-to-Miami snowbird vehicle transport starting in early autumn."
      ]
    },
    "dataSources": "Data sources: Google Maps geogrid tracking, Google Search Console, and CallRail inbound call tracking."
  },
  {
    "slug": "smoke-it-up",
    "title": "From Not in the Top 100 to #1 on Google for 14 Local Searches",
    "client": "Smoke It Up",
    "location": "Angleton, TX · Cypress, TX",
    "industry": "Retail & Smoke Shop",
    "category": "Retail & Transport",
    "tag": "RETAIL • MULTI-LOCATION LOCAL SEARCH",
    "timeline": "Multi-Location Retail Climb",
    "desc": "Transformed visibility for two Texas retail locations (Angleton & Cypress), propelling 14 keywords to #1 on Google and generating 122.4K search impressions and 287 phone calls in 60 days.",
    "highlight": "14 #1 Google Rankings",
    "img": "/images/blog-img-05.jpg",
    "metrics": [
      {
        "val": "14",
        "lbl": "Keywords at #1 on Google"
      },
      {
        "val": "23 / 27",
        "lbl": "Keywords in Top-3 Organic"
      },
      {
        "val": "122.4K",
        "lbl": "Search Impressions (60 Days)"
      },
      {
        "val": "287",
        "lbl": "Store Calls in 60 Days"
      }
    ],
    "services": [
      "Local SEO",
      "GBP Management",
      "Content Optimization",
      "Store Foot-Traffic"
    ],
    "challenge": {
      "heading": "Overcoming Invisibility in Both Suburban and Metro Markets",
      "paragraphs": [
        "Almost every retail smoke and vape shop purchase starts with a mobile search like 'smoke shop near me' or 'vape shop open now'. Local visibility directly dictates in-store foot traffic.",
        "In November 2025, the Angleton store was missing from results for vape, tobacco, water pipe, and CBD searches (22 of 27 tracked keywords were outside the top 100).",
        "The Cypress location in the cutthroat Houston metro market did not rank in the top 100 for any of its 19 tracked keywords."
      ]
    },
    "whatWeDid": {
      "heading": "Ground-Up Reconstruction of Local Search & Map Listings",
      "summary": "Rebuilt on-page taxonomy, inventory categories, and Google Business Profiles for both storefronts.",
      "steps": [
        {
          "title": "Complete GBP Optimization",
          "desc": "Configured granular product catalogs, business hours, and geotagged storefront imagery for both locations."
        },
        {
          "title": "Category Product Hubs",
          "desc": "Engineered web pages targeting glassware, disposables, hookah accessories, and premium tobacco."
        },
        {
          "title": "Local Houston & Angleton SEO",
          "desc": "Optimized geographic signals to pull foot-traffic from neighboring communities in Brazoria and Harris counties."
        },
        {
          "title": "Customer Action Tracking",
          "desc": "Tracked phone calls, website clicks, and in-person driving direction requests directly from Google."
        }
      ]
    },
    "results": {
      "heading": "14 Keywords at #1 on Google and 23 of 27 in Top 3",
      "paragraphs": [
        "In Angleton, 14 keywords soared to the #1 position on Google, and 23 of 27 tracked keywords reached the top 3 organic results.",
        "In Cypress, 5 major competitive keywords moved from outside the top 100 straight onto page one of Google.",
        "The two profiles generated 287 customer phone calls and 251 direct driving navigation requests in 60 days, backed by 122,400 Google Search impressions."
      ]
    },
    "whatsNext": {
      "heading": "Expanding Brand Exclusives and In-Store Loyalty Programs",
      "paragraphs": [
        "Integrating in-store inventory search feeds into Google Merchant Center and promoting loyalty club signups through local search."
      ]
    },
    "dataSources": "Data sources: Google Search Console, Google Business Profile Performance Metrics, and organic keyword tracking."
  }
];

export function getAllCaseStudySlugs(): string[] {
  return CASE_STUDIES.map((c) => c.slug);
}

export function getCaseStudyBySlug(slug: string): CaseStudyItem | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
