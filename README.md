# Quickupp Softech LLC

> **Marketing. AI. Technology. Built for Growth.**  
> A high-performance, enterprise-grade Next.js web platform engineered with React 19, TypeScript, Tailwind CSS v4, and modern fluid typography.

---

## 🚀 Overview

**Quickupp Softech LLC** is a strategic growth and technology partner delivering integrated solutions across digital marketing, artificial intelligence, and software engineering. This repository contains the complete official corporate web platform, designed for optimal performance, accessibility, seamless client-side transitions, and pixel-perfect responsiveness across all device form factors.

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | `16.3.4` (App Router) | High-performance React framework with SSR, SSG, and file-based routing |
| **React** | `19.2.8` | Modern concurrent UI library with server and client components |
| **TypeScript** | `^5.0.0` | Strict static type checking and domain data modeling |
| **Tailwind CSS** | `^4.0.0` | Utility-first styling engine integrated with PostCSS |
| **Typography System** | `Plus Jakarta Sans` | Universal geometric sans-serif typeface across all pages and components |
| **Interactive Scripts** | Custom Webflow Engine | Fluid micro-interactions, scroll reveals, and reinitialization lifecycle |

---

## 📂 Project Architecture

```plaintext
QUICKUPP-USA/
├── app/                                # Next.js App Router root
│   ├── about/                          # About pages & company pillars
│   │   ├── our-approach/               # Strategic methodology & workflow
│   │   ├── our-team/                   # Leadership & technical team
│   │   ├── who-we-are/                 # Core identity & capabilities
│   │   ├── why-businesses-choose-us/   # Client trust & ROI rationale
│   │   ├── why-choose-us/              # Competitive advantages
│   │   └── page.tsx                    # Main About landing hub
│   ├── blog/                           # Insights & technical articles
│   │   ├── [slug]/                     # Dynamic article detail routes
│   │   └── page.tsx                    # Blog catalog & category filters
│   ├── career/                         # Careers & open engineering/marketing roles
│   ├── case-studies/                   # Real-world client case studies & metrics
│   ├── contact/                        # Interactive enquiry & consultation form
│   ├── faq-page/                       # Comprehensive searchable FAQ
│   ├── industries/                     # Industry vertical solutions
│   │   ├── ecommerce/                  # E-Commerce & Retail
│   │   ├── education/                  # EdTech & Academic institutions
│   │   ├── healthcare/                 # Healthcare & MedTech
│   │   ├── home-services/              # Home & Field Services
│   │   ├── interior-design/            # Architecture & Interior Design
│   │   ├── it-saas/                    # B2B SaaS & Tech Enterprises
│   │   ├── professional-services/      # Law, Finance & Consulting
│   │   ├── real-estate/                # Commercial & Residential Real Estate
│   │   ├── travel-hospitality/         # Travel, Hotels & Hospitality
│   │   └── page.tsx                    # Industry hub overview
│   ├── portfolio/                      # Featured client projects & deliverables
│   ├── privacy-policy/                 # GDPR / CCPA privacy policy
│   ├── services/                       # Service categories & sub-services
│   │   ├── ai-automation-solutions/    # Autonomous AI agents & RAG workflows
│   │   ├── ai-video-production/        # Avatar, UGC & AI video generation
│   │   ├── information-technology-services/ # Custom software, apps & web systems
│   │   ├── marketing-design-staff-augmentation/ # Dedicated remote tech & design talent
│   │   ├── marketing-services/         # Performance marketing, SEO & AEO/GEO
│   │   └── page.tsx                    # Master service catalog
│   ├── terms-of-service/               # Legal terms & engagement conditions
│   ├── layout.tsx                      # Root layout, fonts, and script loaders
│   ├── page.tsx                        # High-converting Homepage
│   └── globals.css                     # Global design tokens, typography & responsiveness
├── components/                         # Modular React components
│   ├── Header.tsx                      # Global navigation with dropdown menus
│   ├── Footer.tsx                      # Comprehensive footer with official social badges
│   ├── WebflowReinit.tsx               # Route change script & animation re-initializer
│   ├── AboutSubNav.tsx                 # Sub-navigation bar for company pages
│   ├── RitovexServicesListing.tsx      # Interactive service grid component
│   ├── IndustryDetailPage.tsx          # Reusable industry vertical template
│   └── ...                             # Specialized service page templates
├── data/                               # Typed datasets & content modules
│   ├── blogs.ts                        # Blog article metadata and content
│   ├── industries/                     # Per-industry content models
│   └── services/                       # Per-service deliverables, FAQs & case studies
├── lib/                                # Utilities, types & sitemap helpers
│   ├── servicePageTypes.ts             # TypeScript interfaces for service templates
│   ├── servicesData.ts                 # Service catalog data dictionary
│   └── sitemap.ts                      # Dynamic sitemap generator
└── public/                             # Optimized static media assets & fonts
```

---

## 🎨 Design System & Typography

### Unified Typography Standard
The entire web platform adheres to a standardized typography scale powered by **Plus Jakarta Sans**:

- **Hero Headings (`h1`, `.hero-title`, `.qs-main-title`):** Fluid `clamp(26px, 3.2vw, 40px)` with `800` weight, `-0.025em` tracking, and `1.2` line height.
- **Section Headings (`h2`, `.section-heading`):** Fluid `clamp(22px, 2.4vw, 32px)` with `700` weight and `-0.02em` tracking.
- **Card & Sub-Headings (`h3`, `h4`):** Proportional `clamp(17px, 1.8vw, 22px)` with `700` weight.
- **Paragraphs & Body Text (`p`, `.paragraph`):** Crisp `15.5px - 16.5px` with `#475569` body color and `1.65 - 1.7` line height for maximum readability.
- **Eyebrows & Badges:** `11px - 12px` uppercase with gradient glow accent dots.

### Responsive Breakpoints
- **4K / Ultra-wide Screens (>1440px):** Content comfortably centered with `1240px` max-width constraint.
- **Laptops & Desktops (992px – 1440px):** 28px outer container margin ensuring breathing room.
- **Tablets (601px – 991px):** Adaptive multi-column to single-column flex/grid layouts with 20px edge padding.
- **Mobile Phones (≤600px):** 16px fluid padding, zero horizontal scroll, responsive touch-target buttons, and optimized form inputs.

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation
Clone the repository and install dependencies:

```bash
cd QUICKUPP-USA
npm install
```

### Development Server
Run the Next.js development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser. Hot reload is active for immediate preview of code changes.

### Production Build
Create an optimized production bundle:

```bash
npm run build
```

To run the production build locally:

```bash
npm start
```

---

## 🌐 Brand Social Channels

The footer includes authentic official social channels configured with verified brand vectors:

- **Facebook:** [https://www.facebook.com/quickupp](https://www.facebook.com/quickupp)
- **X (Twitter):** [https://x.com/quickupp](https://x.com/quickupp)
- **Instagram:** [https://www.instagram.com/quickupp](https://www.instagram.com/quickupp)
- **LinkedIn:** [https://www.linkedin.com/company/quickupp](https://www.linkedin.com/company/quickupp)
- **YouTube:** [https://www.youtube.com/@quickupp](https://www.youtube.com/@quickupp)

---

## 📄 License & Ownership

Copyright © 2026 **Quickupp Softech LLC**. All rights reserved.  
Unauthorized distribution, copying, or commercial use without prior written consent is strictly prohibited.
