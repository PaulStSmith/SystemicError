/* One manually placed desktop display unit; account configuration controls activation. */
(() => {
  const desktop = matchMedia('(min-width: 1101px)');
  const configUrl = new URL('adsense.json', document.currentScript.src);
  let started = false;
  async function mountAd() {
    if (started || !desktop.matches || !document.querySelector('.article-layout')) return;
    started = true;
    try {
      const response = await fetch(configUrl, {cache: 'no-cache'});
      if (!response.ok) return;
      const config = await response.json();
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
      document.querySelector('.article-layout').append(aside);
      const initialize = () => { (window.adsbygoogle = window.adsbygoogle || []).push({}); };
      const existing = document.querySelector('script[data-systemic-adsense]');
      if (existing) { initialize(); return; }
      const script = document.createElement('script');
      script.dataset.systemicAdsense = '';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + config.publisherId;
      script.addEventListener('load', initialize, {once:true});
      document.head.append(script);
    } catch { /* Reading remains available if configuration or advertising is blocked. */ }
  }
  desktop.addEventListener('change', mountAd);
  mountAd();
})();
