/* Shared newsletter navigation; sends no reader information. */
(() => {
  if (window.systemicPublicationInitialized) return;
  window.systemicPublicationInitialized = true;
  const base = new URL('.', document.currentScript.src);
  const url = name => new URL(name, base).href;
  if (!document.querySelector('.subscription-page,.policy-page,script[data-systemic-article-ads]')) {
    const script = document.createElement('script');
    script.dataset.systemicArticleAds = '';
    script.src = url('article-ads.js');
    script.async = true;
    document.head.append(script);
  }
  if (!document.querySelector('link[data-publication-style]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = url('publication-pages.css');
    style.dataset.publicationStyle = ''; document.head.append(style);
  }
  const hasLink = (parent, name) => [...parent.querySelectorAll('a')].some(a => a.href === url(name));
  const link = (name, text) => { const a = document.createElement('a'); a.href = url(name); a.textContent = text; return a; };
  const nav = document.querySelector('.nav');
  if (nav && !hasLink(nav, 'subscribe.html')) nav.insertBefore(link('subscribe.html', 'Subscribe'), nav.querySelector('.nav-caption'));
  const footer = document.querySelector('.footer-inner');
  if (footer) {
    if (!hasLink(footer, 'subscribe.html')) footer.append(link('subscribe.html', 'Subscribe'));
    if (!hasLink(footer, 'privacy.html')) footer.append(link('privacy.html', 'Privacy'));
  }
  const main = document.querySelector('main');
  if (main && !document.querySelector('.subscription-page,.policy-page,.subscribe-callout')) {
    const section = document.createElement('section'); section.className = 'subscribe-callout';
    section.setAttribute('aria-label', 'Subscribe by email');
    const heading = document.createElement('h2'); heading.textContent = 'Keep following the system.';
    const text = document.createElement('p'); text.textContent = 'Get new Systemic Error posts by email. Free to subscribe. Unsubscribe whenever you like.';
    section.append(heading, text, link('subscribe.html', 'Subscribe by email →'));
    main.append(section);
  }
})();
