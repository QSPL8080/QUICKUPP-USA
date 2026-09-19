import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import WebflowReinit from "@/components/WebflowReinit";
import LeadModal from "@/components/LeadModal";

export const metadata: Metadata = {
  title: "Quickupp Softech | Marketing. AI. Technology. Built for Growth.",
  description:
    "Quickupp Softech is a full-service digital marketing, AI and technology agency helping businesses grow through social media, SEO, paid marketing, AI automation, web & app development and more.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=Plus+Jakarta+Sans:ital,wght@0,300..700;1,300..700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/mercket.webflow.shared.3eb5ac14d.min.css" />
        <link rel="stylesheet" href="/css/scaleforge-perfect.css" />
        <link rel="preload" as="image" href="/images/slider-01-01.jpg" fetchPriority="high" />
        <Script
          src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
          strategy="lazyOnload"
        />
        <Script id="webfont-load" strategy="lazyOnload">{`
          if (window.WebFont) {
            WebFont.load({
              google: {
                families: ["DM Sans:300,400,500,600,700","Plus Jakarta Sans:300,400,500,600,700"]
              }
            });
          }
        `}</Script>
        <Script id="w-mod-js" strategy="beforeInteractive">{`
          !function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);
        `}</Script>
        <Script id="wf-page-ids" strategy="beforeInteractive">{`
          (function(){var h=document.documentElement;h.setAttribute("data-wf-site","6944f1597ac277b25076ccab");if(location.pathname==="/"){h.setAttribute("data-wf-page","6944f1597ac277b25076cc8e");}})();
        `}</Script>
        <Script src="/js/jquery.js" strategy="beforeInteractive" />
      </head>
      <body>
        {children}
        <LeadModal />
        {/* Exactly the script set the Mercket reference home page loads. The extra
            bundles from other template pages were re-initialising Webflow and
            crashing it ("t is not a function"), which froze every animation. */}
        <Script src="/js/webflow.schunk.36b8fb49256177c8.js" strategy="afterInteractive" />
        <Script src="/js/webflow.schunk.7bc38d72505cd683.js" strategy="afterInteractive" />
        <Script src="/js/webflow.schunk.c62231c40fdafb09.js" strategy="afterInteractive" />
        <Script src="/js/webflow-script.js" strategy="afterInteractive" />
        <WebflowReinit />
      </body>
    </html>
  );
}
