import type { Metadata } from "next";
import Script from "next/script";
import ThemeScripts from "@/components/ThemeScripts";
import "./globals.css";
import "./assurix-service.css";
import "./site-type.css";
import QuickuppEngineReinit from "@/components/QuickuppEngineReinit";
import MetaPixelPageView from "@/components/MetaPixelPageView";
import ButtonTone from "@/components/ButtonTone";
import PayNowModal from "@/components/PayNowModal";
import DynamicEmailModal from "@/components/DynamicEmailModal";

/* Google Tag Manager container for this website */
const GTM_ID = "GTM-KDJV786R";
/* Meta (Facebook) Pixel for this website */
const META_PIXEL_ID = "1916135312886878";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.quickuppsoftech.us"),
  alternates: {
    canonical: "https://www.quickuppsoftech.us",
    languages: {
      "en-US": "https://www.quickuppsoftech.us",
      "x-default": "https://quickuppsoftech.us",
    },
  },
  generator: "Quickupp Softech",
  applicationName: "Quickupp Softech",
  title: "IT & Digital Marketing Services | Quickupp Softech",
  description:
    "Quickupp Softech delivers web development, SEO, paid marketing and digital solutions for growing businesses. Explore services and book a call.",
  verification: {
    google: "LRVDf14TwT0MYqtLiUhSCGZRgMOALA6QyZ8aThDo86s",
  },
  openGraph: {
    title: "IT & Digital Marketing Services | Quickupp Softech",
    description:
      "Digital marketing, AI and technology solutions for businesses across the US.",
    images: ["/images/graph.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IT & Digital Marketing Services | Quickupp Softech",
    description:
      "Digital marketing, AI and technology solutions for businesses across the US.",
    images: ["/images/graph.webp"],
    creator: "@QuickuppL57802",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.quickuppsoftech.us/#organization",
      "name": "Quickupp Softech LLC",
      "alternateName": "Quickupp Softech",
      "url": "https://www.quickuppsoftech.us",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://www.quickuppsoftech.us/#logo",
        "url": "https://www.quickuppsoftech.us/images/logo-white.png",
        "caption": "Quickupp Softech LLC",
      },
      "image": "https://www.quickuppsoftech.us/images/graph.webp",
      "description":
        "Quickupp Softech is a digital marketing, AI automation, and custom technology solutions company helping businesses scale with data-driven growth.",
      "telephone": "+1-302-754-5679",
      "email": "info@quickuppsoftech.us",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "167 Princeton Street",
        "addressLocality": "Bridgeport",
        "addressRegion": "CT",
        "postalCode": "06605",
        "addressCountry": "US",
      },
      "sameAs": [
        "https://quickuppsoftech.us",
        "https://twitter.com/QuickuppL57802",
        "https://www.linkedin.com/company/quickupp-softech",
        "https://www.facebook.com/quickuppsoftech",
        "https://www.instagram.com/quickuppsoftech",
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+1-302-754-5679",
          "contactType": "sales",
          "email": "info@quickuppsoftech.us",
          "availableLanguage": ["en"],
        },
        {
          "@type": "ContactPoint",
          "telephone": "+1-302-754-5679",
          "contactType": "customer service",
          "email": "support@quickuppsoftech.us",
          "availableLanguage": ["en"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.quickuppsoftech.us/#website",
      "url": "https://www.quickuppsoftech.us",
      "name": "Quickupp Softech",
      "description": "IT & Digital Marketing Services for Growing Businesses",
      "publisher": {
        "@id": "https://www.quickuppsoftech.us/#organization",
      },
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://www.quickuppsoftech.us/#service",
      "name": "Quickupp Softech LLC",
      "url": "https://www.quickuppsoftech.us",
      "parentOrganization": {
        "@id": "https://www.quickuppsoftech.us/#organization",
      },
      "priceRange": "$$",
      "telephone": "+1-302-754-5679",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "167 Princeton Street",
        "addressLocality": "Bridgeport",
        "addressRegion": "CT",
        "postalCode": "06605",
        "addressCountry": "US",
      },
      "areaServed": "US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager (GTM-KDJV786R): first thing in <head> on every page */}
        <script async src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`,
          }}
        />

        {/* Schema.org Organization & WebSite JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        {/* Google Search Console */}
        <meta name="google-site-verification" content="LRVDf14TwT0MYqtLiUhSCGZRgMOALA6QyZ8aThDo86s" />

        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6Z6BNGCRLG"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-6Z6BNGCRLG');
            `,
          }}
        />

        <meta name="generator" content="Quickupp Softech" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=Instrument+Serif:ital@0;1&family=Inter:ital,opsz,wght@0,14..32,300..800;1,14..32,300..800&family=JetBrains+Mono:wght@400;500;600;700&family=Lexend:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..800;1,400..800&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/quickupp.shared.min.css" />
        <link rel="preload" as="image" href="/images/counter-style-three-img-03.jpg" fetchPriority="high" />
        <Script
          id="webfont-script"
          src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
          strategy="lazyOnload"
        />
        <Script
          id="webfont-load"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `if (window.WebFont) { WebFont.load({ google: { families: ["Instrument Serif:400,400i","Inter:300,400,500,600,700","Plus Jakarta Sans:300,400,500,600,700,800","JetBrains Mono:400,500,600,700","Lexend:400,500,600,700"] } }); }`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{delete window.Webflow;Object.defineProperty(window,'Webflow',{value:undefined,writable:false,configurable:false,enumerable:false});}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(o,c){var n=c.documentElement,t=" qs-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var h=document.documentElement;h.setAttribute("data-qs-site","6944f1597ac277b25076ccab");if(location.pathname==="/"){h.setAttribute("data-qs-page","6944f1597ac277b25076cc8e");}})();`,
          }}
        />
        <Script src="/js/jquery.js" strategy="beforeInteractive" />

        {/* Meta Pixel (1916135312886878): last in <head>, as Meta asks */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`,
          }}
        />
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" />`,
          }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript): straight after the opening <body> */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
        {children}
        <ThemeScripts
          srcs={[
            "/js/quickupp.chunk.36b8fb49256177c8.js?v=qs2",
            "/js/quickupp.chunk.7bc38d72505cd683.js?v=qs2",
            "/js/quickupp.chunk.c62231c40fdafb09.js?v=qs2",
            "/js/quickupp-core.js?v=qs2",
          ]}
        />
        <MetaPixelPageView />
        <QuickuppEngineReinit />
        <ButtonTone />
        <PayNowModal />
        <DynamicEmailModal />
      </body>
    </html>
  );
}
