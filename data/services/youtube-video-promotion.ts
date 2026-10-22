/* Content for /services/youtube-video-promotion — exactly as provided. */

export interface YouTubePromotionContent {
  metaTitle: string;
  metaDescription: string;
  crumb: string;
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    text: string;
    ctas: { label: string; href: string }[];
    highlights: string[];
  };
  reach: {
    title: string;
    paragraphs: string[];
    points: string[];
    cta: { label: string; href: string };
  };
  process: {
    title: string;
    subtitle: string;
    steps: { num: string; title: string; desc: string }[];
    cta: { label: string; href: string };
  };
  placements: {
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
    note: string;
  };
  why: {
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  audience: {
    title: string;
    items: { title: string; desc: string }[];
  };
  deliverables: {
    title: string;
    items: string[];
    note: string;
  };
  comparison: {
    title: string;
    intro: string;
    columns: [string, string];
    rows: [string, string][];
    closing: string;
  };
  ready: {
    title: string;
    lines: string[];
    ctas: { label: string; href: string }[];
  };
  faq: {
    title: string;
    items: { q: string; a: string }[];
  };
  form: {
    title: string;
    intro: string;
    cardTitle: string;
    fields: string[];
    submit: string;
    note: string;
  };
}

const content: YouTubePromotionContent = {
  metaTitle: "YouTube Video Promotion | Quickupp Softech",
  metaDescription:
    "Turn your YouTube videos into powerful growth opportunities with targeted YouTube Ads.",
  crumb: "YouTube Video Promotion",
  hero: {
    eyebrow: "YouTube Video Promotion",
    title: "Get Your Videos Seen by the Right Audience.",
    lead: "Turn your YouTube videos into powerful growth opportunities with targeted YouTube Ads.",
    text: "Reach viewers who are genuinely interested in your content through professionally managed YouTube advertising campaigns. From audience research and campaign setup to optimization and reporting, we help you get more value from every advertising dollar.",
    ctas: [
      { label: "Promote My YouTube Video", href: "#promotion-plan" },
      { label: "Get a Free Strategy Consultation", href: "/contact" },
    ],
    highlights: ["Targeted campaigns", "Real ad-driven views", "Expert campaign management"],
  },
  reach: {
    title: "Make Your Content Reach Beyond Your Subscribers",
    paragraphs: [
      "Creating great videos is only half the journey. Getting them in front of the right audience is what helps your content gain visibility.",
      "Whether you're a content creator, musician, business, influencer or brand, our YouTube Video Promotion service helps you reach relevant viewers through targeted advertising.",
    ],
    points: [
      "Reach audiences based on interests, demographics and viewing behavior.",
      "Promote videos to people who are more likely to be interested in your content.",
      "Increase video visibility through paid YouTube placements.",
      "Track campaign performance with transparent reporting.",
      "Optimize campaigns based on actual performance data.",
    ],
    cta: { label: "Start Promoting Your Video", href: "#promotion-plan" },
  },
  process: {
    title: "How Our YouTube Promotion Works",
    subtitle: "A Simple Process. A Smarter Way to Grow.",
    steps: [
      {
        num: "01",
        title: "Choose Your Video",
        desc: "Share your YouTube video or channel link with us. Tell us what you want to achieve, whether it's greater visibility, more views, channel awareness or website traffic.",
      },
      {
        num: "02",
        title: "Define Your Target Audience",
        desc: "We research your ideal audience based on location, age, interests, relevant content and viewing behavior to develop a suitable targeting strategy.",
      },
      {
        num: "03",
        title: "Launch Your YouTube Campaign",
        desc: "Our team develops your advertising campaign, prepares ad messaging, configures targeting and launches your video promotion through Google Ads, subject to platform approval.",
      },
      {
        num: "04",
        title: "Optimize for Better Performance",
        desc: "We monitor campaign delivery, analyze audience engagement and refine targeting, placements and budgets based on the available performance data.",
      },
      {
        num: "05",
        title: "Track Your Results",
        desc: "Receive campaign reports that help you understand your advertising spend, views, reach, engagement and other available performance metrics.",
      },
    ],
    cta: { label: "Launch My Campaign", href: "#promotion-plan" },
  },
  placements: {
    title: "Promote Your Videos Across YouTube",
    subtitle: "Get Your Content in Front of Viewers Where They Watch.",
    items: [
      {
        title: "YouTube In-Stream Ads",
        desc: "Reach viewers with video ads that play before, during or after eligible YouTube videos, depending on campaign settings.",
      },
      {
        title: "YouTube In-Feed Ads",
        desc: "Showcase your video in relevant YouTube browsing experiences, including eligible search results and recommendations.",
      },
      {
        title: "YouTube Shorts Ads",
        desc: "Promote vertical video creatives within eligible Shorts advertising placements to reach audiences consuming short-form content.",
      },
      {
        title: "YouTube Search Promotion",
        desc: "Reach relevant audiences through eligible video advertising placements associated with YouTube search experiences.",
      },
    ],
    note: "Available placements depend on campaign objectives, creative format, eligibility and Google Ads settings.",
  },
  why: {
    title: "Why Choose Quickupp for YouTube Video Promotion?",
    subtitle: "More Than Just Views. A Strategy Behind Every Campaign.",
    items: [
      {
        title: "Audience-Focused Targeting",
        desc: "We research and define relevant audience segments to help your video reach people interested in your niche.",
      },
      {
        title: "Professionally Managed Campaigns",
        desc: "Our team handles campaign planning, setup, monitoring and optimization, so you can focus on creating content.",
      },
      {
        title: "Real, Ad-Driven Viewers",
        desc: "Your video is promoted through paid advertising, not bots, fake views or artificial engagement schemes.",
      },
      {
        title: "Performance-Based Optimization",
        desc: "We analyze campaign performance and make informed adjustments to improve efficiency and audience relevance.",
      },
      {
        title: "Transparent Reporting",
        desc: "Understand where your budget goes and how your campaign performs through clear reporting.",
      },
      {
        title: "Dedicated Campaign Support",
        desc: "Get assistance with campaign strategy, creative recommendations, ad setup and performance reviews.",
      },
    ],
  },
  audience: {
    title: "Who Can Benefit from YouTube Promotion?",
    items: [
      {
        title: "Content Creators & YouTubers",
        desc: "Promote new uploads, reach viewers interested in your niche and introduce your content to new audiences.",
      },
      {
        title: "Musicians & Artists",
        desc: "Give your music videos, official releases, teasers and performances additional exposure through targeted ads.",
      },
      {
        title: "Businesses & Brands",
        desc: "Build brand awareness, showcase products and services, and reach relevant audiences through video advertising.",
      },
      {
        title: "Podcasters & Educators",
        desc: "Promote podcast episodes, educational videos, tutorials and valuable content to relevant viewers.",
      },
      {
        title: "Influencers & Personal Brands",
        desc: "Increase the visibility of your video content and introduce your channel to potential followers.",
      },
      {
        title: "Real Estate & Local Businesses",
        desc: "Showcase properties, services, projects and business stories to audiences in selected locations.",
      },
    ],
  },
  deliverables: {
    title: "What You Get With Our YouTube Promotion Service",
    items: [
      "Audience research and targeting strategy",
      "Campaign planning and objective selection",
      "Google Ads campaign setup and management",
      "Video placement and audience configuration",
      "Campaign monitoring and optimization",
      "Budget allocation recommendations",
      "Performance tracking and reporting",
      "Ongoing campaign support",
    ],
    note: "Advertising budget is separate from the campaign management fee. Deliverables depend on the selected plan.",
  },
  comparison: {
    title: "YouTube Promotion vs. Organic Growth",
    intro: "Both organic content and paid promotion can play an important role in building a YouTube channel.",
    columns: ["Organic Growth", "Paid YouTube Promotion"],
    rows: [
      ["Relies on content discovery and audience interest", "Uses paid advertising to increase exposure"],
      ["Results depend on content performance and discoverability", "Campaign delivery is influenced by budget and targeting"],
      ["Growth can take time and is less predictable", "Provides more control over campaign reach"],
      ["No media spend required", "Requires an advertising budget"],
      ["Builds long-term discoverability", "Supports specific promotional objectives"],
    ],
    closing:
      "The best strategy is often a combination of both. Paid promotion can help more people discover your content, while engaging videos and consistent publishing help build lasting audience relationships.",
  },
  ready: {
    title: "Ready to Get More Eyes on Your Videos?",
    lines: [
      "Your next video could reach a whole new audience.",
      "Let our team help you plan and manage a targeted YouTube advertising campaign built around your goals, audience and budget.",
      "Get started with a campaign strategy tailored to your content.",
    ],
    ctas: [
      { label: "Promote My Video", href: "#promotion-plan" },
      { label: "Talk to Our Team", href: "/contact" },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    items: [
      {
        q: "1. How does YouTube video promotion work?",
        a: "We use Google Ads to promote your video to selected audiences across eligible YouTube advertising placements. Our team manages campaign setup, targeting, monitoring and optimization.",
      },
      {
        q: "2. Are the views real?",
        a: "Yes. Your video is advertised to real people through YouTube's advertising ecosystem. We do not use bots, fake views or artificial engagement. However, views and engagement are not guaranteed.",
      },
      {
        q: "3. How much does YouTube video promotion cost?",
        a: "The total cost depends on your advertising budget, target audience, campaign objective and management requirements. Contact our team for a customized proposal.",
      },
      {
        q: "4. How long does it take to launch a campaign?",
        a: "Campaign launch time depends on the availability of your video, campaign setup and Google's ad review and approval process.",
      },
      {
        q: "5. Can I target viewers in specific countries?",
        a: "Yes. Eligible campaigns can target selected countries, regions and locations, depending on your campaign objectives and Google Ads targeting options.",
      },
      {
        q: "6. Can YouTube promotion help me gain subscribers?",
        a: "Paid video promotion can introduce your channel to new viewers who may choose to subscribe. Subscriber growth depends on content quality, audience relevance and viewer interest. We cannot guarantee a specific number of subscribers.",
      },
      {
        q: "7. Can I promote an existing YouTube video?",
        a: "Yes. You can share a link to an eligible existing video for us to assess its suitability for advertising.",
      },
      {
        q: "8. Will YouTube promotion help me monetize my channel?",
        a: "Paid promotion may help increase exposure, but it does not guarantee monetization eligibility. YouTube's monetization requirements and policies still apply, and paid advertising views do not automatically count toward every monetization threshold.",
      },
      {
        q: "9. Do you provide campaign performance reports?",
        a: "Yes. We provide reports based on available campaign metrics, which may include impressions, views, view rate, cost, clicks and other relevant results.",
      },
      {
        q: "10. Do I need to know Google Ads to get started?",
        a: "No. Our team can manage the campaign process, explain your options and provide support throughout the promotion.",
      },
    ],
  },
  form: {
    title: "Let's Get Your Video in Front of the Right Audience",
    intro:
      "Tell us a little about your video, your target audience and your campaign goals. Our team will help you identify a suitable promotion strategy.",
    cardTitle: "Request a YouTube Promotion Plan",
    fields: [
      "Name",
      "Email",
      "Phone / WhatsApp",
      "YouTube Video or Channel URL",
      "Target Country",
      "Campaign Objective",
      "Estimated Advertising Budget",
    ],
    submit: "Get My Promotion Plan",
    note: "Our team will review your requirements and get in touch to discuss the next steps.",
  },
};

export default content;
