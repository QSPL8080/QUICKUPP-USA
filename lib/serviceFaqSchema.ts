/*
 * FAQ structured data (schema.org FAQPage) for the service pages, from the
 * "QS LLC WEBSITE H1 & Schema Markup" document. Rendered as JSON-LD by
 * app/services/[category]/[slug]/page.tsx.
 */
export const SERVICE_FAQ_SCHEMA: Record<string, { q: string; a: string }[]> = {
  "social-media-marketing": [
    { q: "What does Social Media Marketing include?", a: "Strategy, content creation, management, engagement, advertising, analytics and optimization." },
    { q: "Which platforms do you manage?", a: "Facebook, Instagram, TikTok, Snapchat, YouTube, LinkedIn and Twitter." },
    { q: "Do you provide paid advertising?", a: "Yes. We manage social media campaigns for awareness, traffic, leads and conversions." },
    { q: "Do you create social media content?", a: "Yes. We create posts, Reels, Stories, videos, carousels and promotional creatives." },
  ],
  "seo-ai-search-visibility": [
    { q: "What are SEO & AI Search Visibility Services?", a: "Services designed to improve visibility across traditional search engines and AI-powered search experiences." },
    { q: "What is AEO?", a: "Answer Engine Optimization focuses on making content more useful and discoverable for answer-based searches." },
    { q: "What is GEO?", a: "Generative Engine Optimization focuses on improving brand and content visibility within generative AI search experiences." },
    { q: "Do you provide Local, Ecommerce and National SEO?", a: "Yes. We provide specialized SEO strategies based on your business, market and growth objectives." },
  ],
  "paid-marketing": [
    { q: "Which platforms do you manage?", a: "Google, Meta, LinkedIn, TikTok, Snapchat, YouTube, emerging AI advertising opportunities and Influencer Marketing." },
    { q: "Do you provide PPC Management?", a: "Yes. We provide PPC Advertising and campaign management across relevant paid advertising platforms." },
    { q: "Can you manage multiple platforms?", a: "Yes. We can build multi-platform campaigns based on your audience, objectives and budget." },
    { q: "How do you measure performance?", a: "We track relevant metrics such as CTR, CPC, CPL, CPA, conversions, conversion rate, ROAS and revenue." },
    { q: "How much should I spend on advertising?", a: "Budget depends on your market, competition, customer value, goals and conversion economics. We recommend setting objectives first and then building the media budget." },
  ],
  "content-marketing": [
    { q: "What are Content Marketing Services?", a: "Strategic planning, creation and optimization of content to attract audiences, build authority and support business growth." },
    { q: "Do you provide SEO Blog Writing Services?", a: "Yes. We create SEO-focused blogs based on keywords, search intent and content strategy." },
    { q: "Do you provide website content writing?", a: "Yes. We create content for homepages, service pages, landing pages, product pages, industry pages and more." },
    { q: "Do you provide B2B Content Marketing?", a: "Yes. We create B2B content including blogs, articles, whitepapers, case studies and lead-generation content." },
    { q: "Can you optimize existing content?", a: "Yes. We audit and optimize existing content for relevance, SEO, search intent and conversions." },
  ],
  "media-production": [
    { q: "Do you provide Instagram Reels Shoot Services?", a: "Yes. We create professional Reels for Instagram and other short-form video platforms." },
    { q: "Can you create videos for advertising?", a: "Yes. We produce promotional and video ad creatives for digital advertising campaigns." },
    { q: "Do you provide product video shoots?", a: "Yes. We create product demonstrations, showcases, promotional videos and eCommerce video content." },
    { q: "Can you handle scripting and editing?", a: "Yes. Depending on the project, we can support concept development, scripting, shooting and post-production." },
  ],
  "online-reputation-management": [
    { q: "What is Online Reputation Management?", a: "Online Reputation Management (ORM) involves monitoring, managing and improving your brand’s online image through reviews, ratings, search results and customer engagement." },
    { q: "Why is ORM important?", a: "A strong online reputation builds trust, improves credibility and influences customer decisions." },
    { q: "Do you manage Google Reviews?", a: "Yes. We help businesses monitor, manage and improve their Google reviews and online ratings." },
  ],
  "email-marketing": [
    { q: "What is Email Marketing?", a: "Email marketing is a digital marketing strategy that uses targeted emails to communicate with customers, nurture leads and drive conversions." },
    { q: "Do you provide Email Automation?", a: "Yes. We create automated workflows including welcome emails, lead nurturing, follow-ups and customer retention campaigns." },
    { q: "Can you manage email newsletters?", a: "Yes. We can handle newsletter strategy, content, design, scheduling and performance tracking." },
  ],
  "sms-marketing": [
    { q: "What is SMS Marketing?", a: "SMS marketing uses text messages to communicate directly with customers, promote offers, share updates and drive action." },
    { q: "Do you provide Bulk SMS Marketing?", a: "Yes. We can help businesses plan and manage targeted bulk SMS campaigns for promotional and customer communication purposes." },
    { q: "Can SMS Marketing be automated?", a: "Yes. Automated SMS can be used for reminders, follow-ups, customer engagement and other communication workflows." },
  ],
  "whatsapp-marketing": [
    { q: "What is WhatsApp Marketing?", a: "WhatsApp marketing uses WhatsApp to communicate with customers, promote products or services, generate leads and build customer relationships." },
    { q: "Do you provide WhatsApp Automation?", a: "Yes. We can create automated workflows for lead follow-ups, customer communication and engagement." },
    { q: "Can WhatsApp Marketing generate leads?", a: "Yes. WhatsApp campaigns can help businesses connect with interested prospects and move them through the sales journey." },
  ],
  "web-design-development": [
    { q: "How much does website development cost?", a: "The cost depends on the website type, number of pages, features, integrations and technology requirements. We provide customized proposals based on project scope." },
    { q: "Do you provide WordPress development?", a: "Yes. We provide WordPress website design, development, customization, redesign and maintenance services." },
    { q: "Can you develop Shopify ecommerce websites?", a: "Yes. We build and customize Shopify stores, including themes, products, integrations and ecommerce functionality." },
    { q: "Do you build custom websites?", a: "Yes. Our custom website development services are designed for businesses that require unique features, integrations or workflows." },
    { q: "Do you provide website maintenance?", a: "Yes. We provide ongoing website maintenance, security updates, technical support, performance optimization and content updates." },
  ],
  "application-development": [
    { q: "How much does mobile app development cost?", a: "The cost depends on application complexity, features, platforms, integrations, UI/UX requirements, backend infrastructure, and development timeline. Contact us for a customized estimate" },
    { q: "Do you develop both Android and iOS applications?", a: "Yes. We provide both Android App Development and iOS App Development Services based on your target audience and business requirements." },
    { q: "Can you develop a custom mobile application?", a: "Yes. Our Custom Mobile App Development Services are tailored to your specific business processes, users, features, and technical requirements." },
  ],
  "product-engineering": [
    { q: "What is Product Engineering?", a: "Product Engineering is the process of designing, developing, testing, deploying, and continuously improving a software product based on business and user requirements." },
    { q: "What types of software can Quickupp Softech develop?", a: "We develop custom business software, ERP systems, CRM platforms, HR and payroll software, inventory systems, accounting solutions, SaaS products, enterprise applications, web applications, workflow automation software, and AI-powered solutions." },
    { q: "Can you build software from scratch?", a: "Yes. We can take a software idea from initial discovery and planning through UI/UX, development, testing, deployment, and ongoing enhancement." },
    { q: "Can you customize existing software?", a: "Yes. Depending on the technology and architecture, we can help customize, integrate, modernize, or enhance existing software systems." },
  ],
  "quality-assurance-testing": [
    { q: "What is Quality Assurance & Testing?", a: "Quality Assurance and Software Testing involve evaluating software to identify defects, performance issues, usability problems, compatibility issues, and security risks before release." },
    { q: "Do you provide both manual and automation testing?", a: "Yes. We provide Manual Testing Services and Automation Testing Services based on project requirements." },
    { q: "Can you test mobile applications?", a: "Yes. We provide Mobile App Testing Services for Android and iOS applications." },
  ],
  "ui-ux-design": [
    { q: "What is UI/UX Design?", a: "UI/UX design combines User Interface (UI) and User Experience (UX) design to create digital products that are visually appealing, intuitive, functional, and easy to use." },
    { q: "Do you design both websites and mobile apps?", a: "Yes. We provide Website UI/UX Design and Mobile App UI/UX Design Services for different business and product requirements." },
    { q: "Do you design SaaS products?", a: "Yes. We design SaaS dashboards, platforms, portals, workflows, and product interfaces with a focus on usability and scalability." },
  ],
  "marketing-design-staff-augmentation": [
    { q: "What is Marketing & Design Staff Augmentation?", a: "It is a flexible model that allows businesses to add skilled marketing and design professionals to their existing teams without making permanent in-house hires." },
    { q: "Can I hire dedicated marketing resources?", a: "Yes. We can provide dedicated professionals based on your required skills, workload, and engagement model." },
    { q: "Is staff augmentation available for short-term projects?", a: "Yes. Resources can be added for specific projects, campaigns, or longer-term requirements depending on your needs." },
  ],
  "it-staff-augmentation": [
    { q: "What is IT Staff Augmentation?", a: "IT Staff Augmentation allows businesses to add skilled technology professionals to their existing teams without going through traditional permanent hiring processes." },
    { q: "Can I hire dedicated developers?", a: "Yes. We can provide dedicated developers and other IT professionals based on your project requirements and required skill sets." },
    { q: "Can augmented developers work with our internal team?", a: "Yes. Our resources can work as an extension of your existing technology team and follow your development processes and tools." },
    { q: "Can I hire resources for a short-term project?", a: "Yes. IT resources can be provided for specific projects, temporary requirements, or longer-term engagements." },
  ],
};
