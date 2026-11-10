/* One manually placed desktop display unit; account configuration controls activation. */
(() => {
  if (window.systemicAdsInitialized) return;
  window.systemicAdsInitialized = true;
  const desktop = matchMedia('(min-width: 1101px)');
  const configUrl = new URL('adsense.json', document.currentScript.src);
  let started = false;
  let config;
  function addHouseAd(aside, unit) {
    const house = config.houseAd;
    if (house?.enabled !== true) return;
    let destination;
    try { destination = new URL(house.url); } catch { return; }
    if (destination.protocol !== 'https:' || destination.username || destination.password ||
        !['organization', 'title', 'body', 'cta'].every(key => typeof house[key] === 'string' && house[key].trim())) return;
    const style = document.createElement('style');
    style.textContent = `
      .article-ad > ins[data-ad-status="unfilled"]{display:none!important}
      .article-ad-fallback{box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:26px;width:160px;min-height:600px;padding:24px 18px;border:1px solid #d9dde3;border-top:6px solid #c62026;background:#faf9f6;color:#202b3a!important;text-decoration:none!important;font:16px/1.5 system-ui,sans-serif}
      .article-ad-fallback[hidden]{display:none!important}
      .article-ad-fallback:focus-visible{outline:3px solid #202b3a;outline-offset:-5px}
      .article-ad-fallback:hover .house-cta{text-decoration:underline}
      .article-ad-fallback .house-label{font-size:10px;line-height:1.6;letter-spacing:.12em;text-transform:uppercase;color:#626a75}
      .article-ad-fallback .house-title{font-size:27px;line-height:1.15;font-weight:750;letter-spacing:-.04em}
      .article-ad-fallback .house-organization{font-size:16px;line-height:1.4;font-weight:700}
      .article-ad-fallback .house-body{font-size:14px;line-height:1.6}
      .article-ad-fallback .house-cta{font-size:14px;line-height:1.6;font-weight:700;color:#a71920}
    `;
    document.head.append(style);
    const banner = document.createElement('a');
    banner.className = 'article-ad-fallback';
    banner.href = destination.href;
    banner.hidden = true;
    for (const [name, text] of [['label', 'Community support'], ['organization', house.organization],
        ['title', house.title], ['body', house.body], ['cta', house.cta]]) {
      const span = document.createElement('span');
      span.className = 'house-' + name;
      span.textContent = text;
      banner.append(span);
    }
    aside.append(banner);
    const update = () => {
      banner.hidden = unit.dataset.adStatus !== 'unfilled';
      aside.setAttribute('aria-label', banner.hidden ? 'Advertisement' : 'Community support');
    };
    new MutationObserver(update).observe(unit, {attributes:true, attributeFilter:['data-ad-status']});
    update();
  }
  const loadGoogle = () => {
    if (document.querySelector('script[data-systemic-adsense]')) return;
    const script = document.createElement('script');
    script.dataset.systemicAdsense = '';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + config.publisherId;
    document.head.append(script);
  };
  async function mountAd() {
    if (started || !config || !desktop.matches || !document.querySelector('.article-layout')) return;
    started = true;
    try {
      if (!config) return;
      if (config.enabled !== true || !/^ca-pub-\d{16}$/.test(config.publisherId || '') || !/^\d{10}$/.test(config.slotId || '')) return;
      if (!desktop.matches) { started = false; return; }
      const aside = document.createElement('aside');
      aside.className = 'article-ad';
      aside.setAttribute('aria-label', 'Advertisement');
      const unit = document.createElement('ins');
      unit.className = 'adsbygoogle';
      unit.style.cssText = 'display:inline-block;width:160px;height:600px';
      unit.dataset.adClient = config.publisherId;
      unit.dataset.adSlot = config.slotId;
      aside.append(unit);
      addHouseAd(aside, unit);
      document.querySelector('.article-layout').append(aside);
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      loadGoogle();
    } catch { /* Reading remains available if configuration or advertising is blocked. */ }
  }
  desktop.addEventListener('change', mountAd);
  (async () => {
    try {
      const response = await fetch(configUrl, {cache: 'no-cache'});
      if (!response.ok) return;
      config = await response.json();
      if (config.enabled !== true || !/^ca-pub-\d{16}$/.test(config.publisherId || '')) return;
      if (config.autoAds === true) loadGoogle();
      mountAd();
    } catch { /* Reading remains available when advertising is unavailable. */ }
  })();
})();
