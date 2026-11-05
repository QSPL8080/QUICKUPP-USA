import type { Metadata } from "next";
import Script from "next/script";
import ThemeScripts from "@/components/ThemeScripts";
import "./globals.css";
import "./assurix-service.css";
import "./site-type.css";
import QuickuppEngineReinit from "@/components/QuickuppEngineReinit";
import ButtonTone from "@/components/ButtonTone";
import PayNowModal from "@/components/PayNowModal";
import DynamicEmailModal from "@/components/DynamicEmailModal";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.quickuppsoftech.us"),
  alternates: {
    canonical: "https://www.quickuppsoftech.us",
  },
  generator: "Quickupp Softech",
  applicationName: "Quickupp Softech",
  title: "Quickupp Softech | Marketing. AI. Technology. Built for Growth.",
  description:
    "Quickupp Softech is a full-service digital marketing, AI and technology agency helping businesses grow through social media, SEO, paid marketing, AI automation, web & app development and more.",
  verification: {
    google: "LRVDf14TwT0MYqtLiUhSCGZRgMOALA6QyZ8aThDo86s",
  },
  openGraph: {
    title: "Quickupp Softech | Marketing. AI. Technology. Built for Growth.",
    description:
      "Digital marketing, AI and technology solutions for businesses across the US.",
    images: ["/images/graph.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quickupp Softech | Marketing. AI. Technology. Built for Growth.",
    description:
      "Digital marketing, AI and technology solutions for businesses across the US.",
    images: ["/images/graph.webp"],
    creator: "@QuickuppL57802",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
        <link rel="preload" as="image" href="/images/slider-01-01.jpg" fetchPriority="high" />
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
      </head>
      <body>
        {children}
        <ThemeScripts
          srcs={[
            "/js/quickupp.chunk.36b8fb49256177c8.js?v=qs2",
            "/js/quickupp.chunk.7bc38d72505cd683.js?v=qs2",
            "/js/quickupp.chunk.c62231c40fdafb09.js?v=qs2",
            "/js/quickupp-core.js?v=qs2",
          ]}
        />
        <QuickuppEngineReinit />
        <ButtonTone />
        <PayNowModal />
        <DynamicEmailModal />
      </body>
    </html>
  );
}
