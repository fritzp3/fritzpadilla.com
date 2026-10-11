import Script from "next/script";
import { site } from "@/content/site";

/**
 * Google Analytics 4 (gtag.js). The `gtag` queue is always defined, but the
 * gtag.js library is only fetched on the live hostname, so `npm run preview`,
 * `next dev` and the e2e runs send nothing to Google. GA4's enhanced
 * measurement records client-side navigations as page views.
 *
 * Enhanced measurement ignores in-page anchors and mailto: links, so one
 * delegated click listener adds two events: `nav_click` (nav links and any
 * `/#section` link) and `contact_email_click` (mark it a key event in GA).
 * Both carry `link_text`, `link_url` and `link_location` (nav or page).
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
}
document.addEventListener('click', function (e) {
  var a = e.target instanceof Element && e.target.closest('a[href]');
  if (!a) return;
  var href = a.getAttribute('href');
  var inNav = !!a.closest('nav');
  var name = href.indexOf('mailto:') === 0 ? 'contact_email_click'
    : inNav || href.indexOf('/#') === 0 ? 'nav_click' : null;
  if (!name) return;
  gtag('event', name, {
    link_text: a.textContent.trim(),
    link_url: href,
    link_location: inNav ? 'nav' : 'page'
  });
}, true);`}
    </Script>
  );
}
