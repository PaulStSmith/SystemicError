/* Google Analytics for the public Systemic Error website. */
(() => {
  if (!['systemicerror.media', 'www.systemicerror.media'].includes(location.hostname)) return;
  if (window.systemicAnalyticsInitialized) return;
  window.systemicAnalyticsInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-0TSN29RW2F', {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=G-0TSN29RW2F';
  document.head.append(tag);
})();
