import Script from "next/script";
import { site } from "@/content/site";

/**
 * Google Analytics 4 (gtag.js). The `gtag` queue is always defined, but the
 * gtag.js library is only fetched on the live hostname, so `npm run preview`,
 * `next dev` and the e2e runs send nothing to Google. GA4's enhanced
 * measurement records client-side navigations as page views.
 */
export default function Analytics() {
  const host = new URL(site.url).hostname;
  return (
    <Script id="google-analytics" strategy="afterInteractive">
      {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${site.gaId}');
if (location.hostname === '${host}') {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=${site.gaId}';
  document.head.appendChild(s);
}`}
    </Script>
  );
}
