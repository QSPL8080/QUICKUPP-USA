/*
 * About subpages content. Every string below is the page copy that was
 * already on the site (moved out of the old About components unchanged).
 * Placeholder stats, the sample team and labels that were not part of the
 * copy have been left out.
 */

export type AboutCta = { label: string; href: string };

export type AboutTitle = { text: string; accent?: string };

export type AboutSection =
  | {
      kind: "statement";
      eyebrow?: string;
      title: AboutTitle;
      paras: string[];
      list?: string[];
      highlight?: string;
      cta?: AboutCta;
      images?: [string, string];
      aside?: { label: string; items: string[]; after?: string };
    }
  | {
      kind: "panels";
      eyebrow?: string;
      title: AboutTitle;
      paras?: string[];
      highlight?: string;
      panels: { label: string; title?: string; text: string }[];
      note?: string;
      cta?: AboutCta;
    }
  | {
      kind: "route";
      eyebrow?: string;
      title: AboutTitle;
      intro?: string;
      steps: { label?: string; title: string; text?: string; quote?: string }[];
      after?: string;
      cta?: AboutCta;
    }
  | {
      kind: "index";
      eyebrow?: string;
      title: AboutTitle;
      items: { title: string; desc: string; list?: string[]; sub?: string; cta?: AboutCta }[];
    }
  | {
      kind: "goals";
      eyebrow?: string;
      title: AboutTitle;
      paras: string[];
      listIntro?: string;
      items: string[];
      after?: string;
    }
  | {
      kind: "proof";
      eyebrow?: string;
      title: AboutTitle;
      paras: string[];
      note?: string;
      stats: { value: string; label: string }[];
      cta?: AboutCta;
      images?: [string, string];
    };

export interface AboutPageData {
  crumb: string;
  hero: {
    eyebrow?: string;
    title: AboutTitle;
    lead: string;
    paras?: string[];
    highlight?: string;
    cta?: AboutCta;
    image: string;
  };
  sections: AboutSection[];
  closing: {
    eyebrow?: string;
    title: AboutTitle;
    paras: string[];
    lines?: string[];
    ctas: AboutCta[];
  };
}

const SERVICES = "/services/ai-powered-digital-marketing-services";
const img = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
/* hero photos are cut to the hero strip's wide shape, so they don't stretch */
const heroImg = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1920&h=560&q=80`;

/* ---------------------------------------------------------------- Who We Are */
export const whoWeAre: AboutPageData = {
  crumb: "Who We Are",
  hero: {
    eyebrow: "Your Trusted Digital Growth Partner",
    title: { text: "Marketing. AI. Technology.", accent: "Built for Growth." },
    lead:
      "Quickupp Softech is a full-service Marketing, AI & Technology company helping ambitious businesses grow, scale and stay ahead in an increasingly digital world.",
    paras: [
      "We bring together the power of digital marketing, artificial intelligence and technology to help businesses attract the right customers, build stronger brands, improve operations and create meaningful digital experiences.",
      "From performance marketing and SEO to AI automation, AI-powered search visibility, websites, mobile applications and custom software, we combine strategy, creativity, technology and execution to solve real business challenges.",
    ],
    highlight: "We don't just deliver services. We build solutions designed around your growth.",
    cta: { label: "Explore All Services", href: SERVICES },
    image: heroImg("photo-1556761175-b413da4baf72"),
  },
  sections: [
    {
      kind: "panels",
      eyebrow: "MARKETING. AI. TECHNOLOGY.",
      title: { text: "Three Capabilities.", accent: "One Growth Partner." },
      paras: [
        "The way businesses grow is changing faster than ever. Today, customers discover brands through search engines, social media, AI platforms and digital experiences.",
        "At the same time, businesses are adopting automation and intelligent technologies to work faster, operate more efficiently and deliver better customer experiences.",
      ],
      highlight: "We bring these capabilities together under one roof.",
      panels: [
        {
          label: "MARKETING",
          text: "We help businesses get discovered, generate demand and convert attention into customers. From social media marketing and SEO to Google Ads, Meta Ads, content marketing and lead generation, we create growth strategies designed to improve visibility, attract the right audience and deliver measurable business outcomes.",
        },
        {
          label: "AI",
          text: "We help businesses use artificial intelligence to work smarter, automate repetitive processes and create better customer experiences. From AI chatbots and AI agents to workflow automation, AI-powered lead qualification and custom AI solutions, we help turn AI opportunities into practical solutions that create real business value.",
        },
        {
          label: "TECHNOLOGY",
          text: "We help businesses build the digital infrastructure they need to operate, compete and scale. From websites and mobile applications to SaaS platforms, CRM and ERP systems, web applications and custom software, we transform ideas and business requirements into scalable digital solutions.",
        },
      ],
      note: "Marketing attracts. AI accelerates. Technology scales. Together, they create a stronger foundation for sustainable business growth.",
    },
    {
      kind: "goals",
      eyebrow: "MORE THAN AN AGENCY",
      title: { text: "Your Business. Our Expertise.", accent: "One Growth Journey." },
      paras: [
        "We believe the best partnerships go beyond simply completing tasks. Businesses don't need another vendor that only manages campaigns, builds websites or delivers software. They need a growth partner who understands where they are today, where they want to go and what it will take to get there. That's why we work as an extension of your team.",
        "Before recommending a strategy, campaign or technology solution, we take the time to understand your business, market, customers, competition, challenges and growth objectives.",
      ],
      listIntro: "Whether your goal is to:",
      items: [
        "Generate more qualified leads",
        "Increase your online visibility",
        "Build a stronger and more recognizable brand",
        "Improve marketing performance and ROI",
        "Automate repetitive business processes",
        "Implement AI into your operations",
        "Build a high-performing website or digital product",
        "Develop custom software or business platforms",
        "Improve customer experiences through technology",
        "Expand and scale into new markets",
      ],
      after: "We bring together the right people, strategies, technology and tools to help you move forward with clarity and confidence.",
    },
    {
      kind: "statement",
      eyebrow: "BUILT AROUND YOUR BUSINESS",
      title: { text: "Focused on", accent: "Your Growth." },
      paras: [
        "Every business is different. That's why we don't believe in a one-size-fits-all approach.",
        "Your challenges, customers, goals and opportunities are unique. Our approach is built around understanding those factors and creating the right combination of Marketing, AI and Technology to support your next stage of growth.",
        "Whether you need a focused solution in one area or an integrated strategy across multiple capabilities, Quickupp Softech provides the expertise and execution to help turn opportunities into measurable progress.",
      ],
      highlight:
        "Your next stage of growth may start with a marketing campaign, a stronger digital presence, an AI solution, a website, an automation workflow or a new digital product. Wherever it starts, we're here to help you build what comes next.",
      images: [img("photo-1517245386807-bb43f82c33c4", 900), img("photo-1521737711867-e3b97375f902", 900)],
    },
  ],
  closing: {
    eyebrow: "READY TO BUILD WHAT'S NEXT?",
    title: { text: "Let's Turn Your Growth Goals", accent: "Into Action." },
    paras: [
      "Your next stage of growth shouldn't be limited by disconnected agencies, outdated processes or technology that doesn't keep up with your ambitions. Whether you need to generate more customers, strengthen your digital presence, automate your business with AI, or build technology that helps you scale, Quickupp Softech brings the strategy, expertise and execution to make it happen.",
    ],
    lines: [
      "ONE PARTNER. THREE CAPABILITIES. UNLIMITED POSSIBILITIES.",
      "Marketing to attract. - AI to accelerate. - Technology to scale.",
      "Let's understand your business, identify the opportunities and build a growth strategy designed around your goals. Your growth starts with a conversation.",
      "LET'S BUILD YOUR GROWTH STORY.",
    ],
    ctas: [
      { label: "Talk to Our Experts", href: "/contact" },
      { label: "Start Your Project", href: "/contact" },
    ],
  },
};

/* -------------------------------------------------------------- Our Approach */
export const ourApproach: AboutPageData = {
  crumb: "Our Approach",
  hero: {
    eyebrow: "OUR APPROACH",
    title: { text: "Understand. Strategize. Build.", accent: "Optimize. Grow." },
    lead:
      "At Quickupp Softech, we don't believe in one-size-fits-all solutions. We first understand your business, identify the right opportunities and bring together Marketing, AI and Technology to build solutions aligned with your goals.",
    highlight: "We don't start with what we can sell. We start with what your business needs.",
    cta: { label: "Discuss Your Business Goals", href: "/contact" },
    image: heroImg("photo-1557804506-669a67965ba0"),
  },
  sections: [
    {
      kind: "route",
      eyebrow: "HOW WE WORK",
      title: { text: "Understand. Strategize. Build.", accent: "Optimize. Grow." },
      steps: [
        {
          label: "UNDERSTAND",
          title: "Start With the Business.",
          text: "We understand your goals, customers, market, competition, challenges and current systems before recommending a solution.",
          quote: "First, we listen. Then, we solve.",
        },
        {
          label: "STRATEGIZE",
          title: "Find What Will Move the Needle.",
          text: "We turn insights into a focused roadmap with clear priorities, actions and measurable objectives. Instead of recommending services individually, we identify the combination of capabilities that can create the greatest impact.",
          quote: "The right strategy creates the right direction.",
        },
        {
          label: "BUILD",
          title: "Bring the Strategy to Life.",
          text: "Our teams execute across Marketing, AI and Technology - from performance marketing and SEO to AI automation, websites, applications and custom software.",
          quote: "One strategy. One connected execution.",
        },
        {
          label: "OPTIMIZE",
          title: "Measure. Learn. Improve.",
          text: "We track performance, analyze results and continuously improve what we build.",
          quote: "Because launching is not the goal. Better performance is.",
        },
        {
          label: "GROW",
          title: "Build for What's Next.",
          text: "We scale what works, identify new opportunities and evolve your solutions as your business grows.",
          quote: "Today's solution becomes tomorrow's growth engine.",
        },
      ],
      cta: { label: "Build Your Growth Roadmap", href: "/contact" },
    },
    {
      kind: "statement",
      eyebrow: "OUR DIFFERENCE",
      title: { text: "We Connect the Pieces", accent: "Others Keep Separate." },
      paras: [
        "Most businesses have to manage separate partners for marketing, AI and technology. One handles your advertising. Another builds your website. Someone else handles automation.",
        "The result can be disconnected strategies, duplicated effort and missed opportunities. Quickupp brings them together.",
      ],
      list: [
        "Your marketing can connect with your technology.",
        "Your technology can connect with AI.",
        "Your AI can improve your marketing and operations.",
        "And everything can work toward one business objective - growth.",
      ],
      highlight: "We don't just deliver three services. We connect three capabilities into one growth system.",
      cta: { label: "Explore Our Capabilities", href: SERVICES },
      images: [img("photo-1531545514256-b1400bc00f31", 900), img("photo-1553877522-43269d4ea984", 900)],
    },
    {
      kind: "panels",
      title: { text: "ONE APPROACH. THREE CAPABILITIES." },
      panels: [
        {
          label: "01. MARKETING",
          title: "Attract the right customers.",
          text: "Build visibility, generate demand and turn attention into business opportunities.",
        },
        {
          label: "02. AI",
          title: "Work smarter and faster.",
          text: "Automate processes, improve efficiency and create better customer experiences.",
        },
        {
          label: "03. TECHNOLOGY",
          title: "Build to scale.",
          text: "Create the digital infrastructure, products and systems your business needs to grow.",
        },
      ],
      note: "Marketing attracts. AI accelerates. Technology scales.",
      cta: { label: "Find the Right Solution", href: SERVICES },
    },
    {
      kind: "statement",
      eyebrow: "BUILT AROUND YOUR BUSINESS",
      title: { text: "No One-Size-Fits-All Solutions." },
      paras: [
        "Every business has different goals, challenges and opportunities.",
        "That's why we adapt our approach to your business stage, priorities and objectives.",
      ],
      highlight: "You don't need everything we offer. You need the right solution at the right time.",
      aside: {
        label: "THE QUICKUPP WAY",
        items: [
          "Understand the business.",
          "Find the opportunity.",
          "Connect the capabilities.",
          "Build the solution.",
          "Measure the impact.",
          "Keep improving.",
        ],
        after: "That's how we turn business challenges into practical solutions and sustainable growth.",
      },
    },
  ],
  closing: {
    eyebrow: "READY TO BUILD WHAT'S NEXT?",
    title: { text: "Let's Turn Your Goals Into Action." },
    paras: [
      "Whether you have a specific challenge, a new idea or a growth opportunity, let's explore what's possible.",
    ],
    lines: ["Marketing. AI. Technology. One Connected Growth Partner. Let's Start the Conversation."],
    ctas: [
      { label: "Talk to Our Experts", href: "/contact" },
      { label: "Start Your Project", href: "/contact" },
    ],
  },
};

/* ------------------------------------------------------------- Why Choose Us */
export const whyChooseUs: AboutPageData = {
  crumb: "Why Choose Us",
  hero: {
    eyebrow: "WHY CHOOSE US",
    title: { text: "More Than a Service Provider.", accent: "Your Growth Partner." },
    lead:
      "Choosing the right partner for business growth is about more than finding someone who can deliver a service. You need a team that understands your business goals, customers, market and the challenges between where you are today and where you want to be.",
    paras: ["At Quickupp Softech, we bring Marketing, AI and Technology together to help businesses build, improve and scale."],
    highlight:
      "We don't believe in selling disconnected services. We believe in solving business problems and building solutions that create measurable impact.",
    cta: { label: "Talk to a Growth Strategist", href: "/contact" },
    image: heroImg("photo-1521791136064-7986c2920216"),
  },
  sections: [
    {
      kind: "proof",
      eyebrow: "PROOF BEHIND THE PROMISE",
      title: { text: "Experience That Goes", accent: "Beyond the Pitch." },
      paras: [
        "We believe trust should be earned through experience, execution and results. Over the years, Quickupp Softech has worked with businesses across industries, markets and growth stages - helping them strengthen their digital presence, generate opportunities and build better systems.",
      ],
      note: "Our numbers are more than statistics. They represent the businesses, projects and partnerships we've built along the way.",
      stats: [
        { value: "30+", label: "Growth & Technology Professionals" },
        { value: "5+", label: "Industry Experience" },
        { value: "98%", label: "Client Satisfaction" },
        { value: "95%", label: "Projects Delivered On Time" },
      ],
      cta: { label: "Explore Our Work", href: "/case-studies" },
      images: [img("photo-1504384764586-bb4cdc1707b0", 900), img("photo-1531403009284-440f080d1e12", 900)],
    },
    {
      kind: "index",
      title: { text: "Why Businesses Choose Quickupp" },
      items: [
        {
          title: "Marketing + AI + Technology Under One Roof",
          desc: "Most businesses work with different partners for marketing, technology and automation. Quickupp brings these capabilities together - from digital marketing and AI solutions to websites, applications, automation and custom software. Our integrated approach helps different parts of your business work toward the same growth objectives.",
          sub: "One partner. Multiple capabilities. One connected growth strategy.",
        },
        {
          title: "Proven Experience Across Industries",
          desc: "Different industries require different growth strategies. Our experience spans healthcare, real estate, interiors, education, travel, professional services, D2C and technology. We've worked with businesses at different stages - from establishing their digital presence to scaling customer acquisition and technology infrastructure.",
          sub: "We bring cross-industry experience while keeping every solution specific to your business.",
        },
        {
          title: "Strategy Before Execution",
          desc: "We don't believe in starting with a service. We start by understanding your business, objectives, target audience, market, competition and challenges. Only then do we recommend the right strategy, technology or combination of solutions.",
          sub: "Because the right solution isn't the one that sounds impressive. It's the one that solves the right problem.",
        },
        {
          title: "Focused on Business Outcomes",
          desc: "Clicks, impressions, followers and completed projects are only part of the picture. What matters is what those activities do for your business. Our approach focuses on:",
          list: [
            "More qualified leads",
            "Better customer acquisition",
            "Stronger brand visibility",
            "Improved marketing performance",
            "Greater operational efficiency",
            "Reduced repetitive work",
            "Better customer experiences",
            "Scalable digital infrastructure",
            "New opportunities for growth",
          ],
          sub: "We focus on creating business value - not simply delivering tasks.",
        },
        {
          title: "AI-First Approach",
          desc: "AI is changing how businesses market, operate and serve customers. We help businesses identify where AI can create genuine value instead of adopting AI simply because it's trending. From AI automation and AI chatbots to AI agents, lead qualification, intelligent workflows and custom AI solutions, we help businesses integrate AI into practical operations.",
          sub: "We turn AI from an idea into an advantage.",
        },
        {
          title: "Customized Solutions. Never One-Size-Fits-All.",
          desc: "Every business has different goals, customers, budgets, processes and challenges. That's why we don't believe in cookie-cutter solutions. Whether you need a focused marketing campaign, AI automation workflow, new website or complete digital platform, we build our approach around your specific requirements and growth stage.",
          sub: "Your business is unique. Your solution should be too.",
        },
        {
          title: "One Team. One Point of Accountability.",
          desc: "Managing multiple vendors can create unnecessary complexity. Different teams. Different strategies. Different timelines. Different priorities. With Quickupp, you can bring multiple growth requirements under one partner. Our teams work collaboratively across marketing, AI and technology, helping create better alignment, communication and execution.",
          sub: "Less coordination. More progress.",
        },
        {
          title: "Built for Growth & Scale",
          desc: "We don't just think about what your business needs today. We consider what you'll need tomorrow. Our solutions are designed with scalability in mind - from marketing systems and automation workflows to websites, applications, software and digital platforms. As your business grows, your systems should grow with it.",
          sub: "We build with your next stage in mind.",
        },
        {
          title: "Global Growth Perspective",
          desc: "Growth today isn't limited by geography. Quickupp Softech works with businesses across India and international markets, bringing a global perspective to digital marketing, technology and AI solutions. Our experience across different markets helps us understand that successful growth requires more than replicating the same strategy everywhere.",
          sub: "Different markets. Different audiences. Smarter strategies.",
        },
        {
          title: "Transparency & Clear Communication",
          desc: "Great partnerships are built on trust. We believe you should understand what we're doing, why we're doing it and how it contributes to your objectives. Through clear communication, regular updates and transparent reporting, we keep you informed throughout the engagement.",
          sub: "No unnecessary complexity. No confusing jargon. Just clear communication and accountable execution.",
        },
      ],
    },
    {
      kind: "statement",
      eyebrow: "THE QUICKUPP DIFFERENCE",
      title: { text: "We Don't Just Execute.", accent: "We Think Growth." },
      paras: [
        "You may come to us asking for a website. We may identify an opportunity to improve your lead generation.",
        "You may ask for automation. We may discover a larger operational opportunity.",
        "That's because we don't simply execute instructions. We think like growth partners.",
      ],
      highlight:
        "We look at the bigger picture, challenge assumptions when necessary and identify opportunities that can create greater impact for your business.",
    },
    {
      kind: "route",
      eyebrow: "OUR APPROACH",
      title: { text: "Understand. Strategize. Build.", accent: "Grow." },
      intro: "We believe sustainable growth comes from doing the right things in the right order.",
      steps: [
        { title: "UNDERSTAND", text: "We learn about your business, customers, market, competition and objectives." },
        { title: "STRATEGIZE", text: "We identify opportunities and create a practical strategy aligned with your goals." },
        { title: "BUILD", text: "We bring together the right marketing, AI and technology capabilities to execute the solution." },
        { title: "OPTIMIZE", text: "We measure performance, learn from results and continuously improve." },
        { title: "GROW", text: "We help build systems and strategies that support long-term, scalable growth." },
      ],
      cta: { label: "Start With a Growth Consultation", href: "/contact" },
    },
    {
      kind: "statement",
      eyebrow: "TRUSTED BY BUSINESSES. BUILT FOR AMBITION.",
      title: { text: "From Growing Businesses to", accent: "Ambitious Brands." },
      paras: [
        "Our work is built around long-term partnerships, measurable objectives and continuous improvement. 200+ projects. 120+ global clients. One commitment - to help businesses grow smarter.",
      ],
      highlight: "We measure our success not only by what we deliver, but by the value we create for the businesses we work with.",
    },
  ],
  closing: {
    eyebrow: "READY TO GROW DIFFERENTLY?",
    title: { text: "Let's Build What's Next." },
    paras: [
      "Your business doesn't need more disconnected solutions. It needs the right strategy, the right technology and the right partner to bring it all together. Let's understand where your business is today, identify where the biggest opportunities lie and create a clear path toward what's next.",
    ],
    lines: ["Marketing. AI. Technology. - One Partner for Your Growth.", "Let's Build Your Growth Story."],
    ctas: [
      { label: "Talk to Our Experts", href: "/contact" },
      { label: "Start Your Project", href: "/contact" },
    ],
  },
};

/* --------------------------------------------------- Why Businesses Choose Us */
export const whyBusinessesChooseUs: AboutPageData = {
  crumb: "Why Businesses Choose Us",
  hero: {
    eyebrow: "WHY BUSINESSES CHOOSE US",
    title: { text: "Built Around Your Business.", accent: "Focused on What Comes Next." },
    lead:
      "Choosing a growth partner is about more than technical expertise. You need a team that understands your objectives, connects the right capabilities and takes responsibility for execution.",
    highlight:
      "Quickupp Softech combines Marketing, AI and Technology to help businesses solve challenges, create opportunities and build for the future.",
    cta: { label: "Talk to a Growth Expert", href: "/contact" },
    image: heroImg("photo-1552664730-d307ca884978"),
  },
  sections: [
    {
      kind: "index",
      title: { text: "What Sets Quickupp Apart" },
      items: [
        {
          title: "One Partner. Multiple Capabilities.",
          desc: "Marketing, creative, technology and AI often require multiple vendors. Quickupp brings these capabilities together, making it easier to manage projects, align strategies and execute connected solutions.",
          sub: "Marketing. AI. Technology. Built for Growth.",
          cta: { label: "Explore Our Capabilities", href: SERVICES },
        },
        {
          title: "Business-First Thinking",
          desc: "We take the time to understand what actually matters to your business before recommending a solution. Whether the objective is customer acquisition, digital transformation, automation or market expansion, our work starts with the business problem - not the service.",
        },
        {
          title: "Solutions Built Around Your Requirements",
          desc: "No two businesses operate the same way. We adapt our approach to your industry, audience, processes, objectives and stage of growth rather than forcing you into a standard package.",
        },
        {
          title: "Strong Execution",
          desc: "Ideas only create value when they are executed well. Our teams bring together strategy, creative, marketing and technology expertise to move projects from planning to implementation, measurement and refinement.",
          cta: { label: "Discuss Your Project", href: "/contact" },
        },
        {
          title: "Practical AI Adoption",
          desc: "We focus on where AI can create real business value. From AI chatbots and agents to lead qualification, workflow automation, CRM processes and customer support, we identify practical use cases that can improve efficiency and customer experiences.",
          cta: { label: "Explore AI Solutions", href: "/services/ai-automation-solutions" },
        },
        {
          title: "Outcome-Oriented Approach",
          desc: "We look beyond completed tasks. Depending on the engagement, our work can support objectives such as:",
          list: [
            "Generating qualified opportunities",
            "Improving conversion",
            "Increasing online visibility",
            "Reducing manual processes",
            "Improving customer response",
            "Strengthening digital experiences",
            "Creating scalable systems",
          ],
          sub: "The objective is to create measurable business value.",
        },
        {
          title: "Industry-Aware Expertise",
          desc: "Our experience spans Healthcare, Home Services, Professional Services, Education, IT & SaaS, eCommerce, Real Estate, Interior Design, Travel & Hospitality and Automotive. This allows us to understand different customer journeys, buying decisions and business requirements while developing solutions specific to each market.",
          cta: { label: "Explore Our Industries", href: "/industries" },
        },
        {
          title: "Built With Scalability in Mind",
          desc: "Your requirements today may not be the same six months from now. We consider future needs when developing marketing systems, websites, applications, automation and technology solutions - so what we build can evolve with your business.",
        },
        {
          title: "Clear Communication",
          desc: "Good work requires good communication. We maintain clear expectations around scope, timelines, priorities, progress and performance, giving you visibility throughout the engagement.",
        },
        {
          title: "Global Perspective",
          desc: "Businesses today can reach customers far beyond their local market. Our experience across India and international markets helps us approach digital growth with a broader understanding of audiences, competition and market expansion.",
        },
      ],
    },
    {
      kind: "route",
      eyebrow: "THE QUICKUPP DIFFERENCE",
      title: { text: "We Connect", accent: "the Pieces." },
      steps: [
        { title: "A marketing campaign can generate demand." },
        { title: "A website can convert it." },
        { title: "AI can automate what happens next." },
        { title: "Technology can help the entire system scale." },
      ],
      after:
        "Our advantage is understanding how these pieces can work together. Instead of looking at isolated requirements, we look at the bigger business opportunity and connect the right capabilities around it.",
      cta: { label: "Build Your Growth Strategy", href: "/contact" },
    },
    {
      kind: "route",
      title: { text: "How We Work" },
      steps: [
        { title: "Understand", text: "We identify your objectives, challenges and opportunities." },
        { title: "Plan", text: "We define the right approach, priorities and deliverables." },
        { title: "Execute", text: "Our specialists turn the strategy into action." },
        { title: "Measure", text: "We track performance and identify areas for improvement." },
        { title: "Improve", text: "We continuously refine the solution as your business evolves." },
      ],
      cta: { label: "Discuss Your Execution Plan", href: "/contact" },
    },
  ],
  closing: {
    eyebrow: "BUILT FOR BUSINESSES THAT WANT TO MOVE FORWARD",
    title: { text: "Ready to explore what we can build for your business?" },
    paras: [
      "From improving customer acquisition to modernizing operations, Quickupp helps businesses bring together the people, strategies and technology required for their next stage. One Partner for Marketing, AI & Technology.",
    ],
    ctas: [
      { label: "Talk to a Growth Expert", href: "/contact" },
      { label: "Start Your Project", href: "/contact" },
    ],
  },
};

export const ABOUT_NAV = [
  { label: "Who We Are", href: "/about/who-we-are" },
  { label: "Why Choose Us", href: "/about/why-choose-us" },
  { label: "Why Businesses Choose Us", href: "/about/why-businesses-choose-us" },
  { label: "Our Approach", href: "/about/our-approach" },
];
