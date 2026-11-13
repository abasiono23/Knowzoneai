/**
 * Visit counts (Vercel Web Analytics: no cookies, nothing that identifies anyone), loaded only once the
 * visitor has agreed to them. Their choice is kept in the `kz_consent` cookie ("analytics=1&v=1" or
 * "analytics=0&v=1") by the cookie notice: apps/webapp/site.js on the site and study pages,
 * src/components/cookie-notice.tsx in the app. This tag goes in the <head> of every page; the notices
 * send a `kz-consent` event when someone agrees later in the same visit, so the counting starts then.
 */
export const ANALYTICS_SRC = '/_vercel/insights/script.js';
/** Present in every page that has the loader; scripts/seo/check.mjs looks for it. */
export const ANALYTICS_MARK = 'data-kz-analytics';
export const ANALYTICS = `<script ${ANALYTICS_MARK}>(function(){var w=window,d=document;function on(){if(w.__kzAnalytics)return;w.__kzAnalytics=1;var s=d.createElement('script');s.defer=true;s.src='${ANALYTICS_SRC}';d.head.appendChild(s)}try{var m=d.cookie.match(/(?:^|; )kz_consent=([^;]*)/);if(m&&/(?:^|&)analytics=1(?:&|$)/.test(m[1]))on()}catch(e){}w.addEventListener('kz-consent',function(e){if(e.detail&&e.detail.analytics)on()})})();</script>`;
