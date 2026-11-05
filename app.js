// Shared analytics applies to existing pages and every future export.
(() => {
  if (document.querySelector('script[data-systemic-analytics]')) return;
  const tag = document.createElement('script');
  tag.dataset.systemicAnalytics = '';
  tag.async = true;
  tag.src = new URL('analytics.js', document.currentScript.src).href;
  document.head.append(tag);
})();
const dateFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function safeUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } }
function localImage(value) { if (value === 'assets/image-unavailable.svg') return value; return /^assets\/images\/(?:manual\/)?[a-f0-9]+\.[a-z]+$/.test(value || '') ? value : safeUrl(value); }
function image(post, eager = false) { return `<img src="${escapeHtml(localImage(post.cover_image))}" alt="" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`; }
function link(post) { return escapeHtml(post.path || `article.html?slug=${encodeURIComponent(post.slug)}`); }
function date(post) { return dateFormat.format(new Date(post.post_date)); }
function attribution(post) { return post.subtitle || (post.authors?.length ? `By ${post.authors.join(', ')}` : 'Systemic Error'); }
let posts = [], visible = 9;
function renderArticles() {
  const query = document.querySelector('#query').value.trim().toLocaleLowerCase();
  const filtered = posts.filter(post => `${post.title} ${attribution(post)}`.toLocaleLowerCase().includes(query));
  document.querySelector('#article-grid').innerHTML = filtered.slice(0, visible).map(post => `<article class="article-card"><a class="article-image" href="${link(post)}" tabindex="-1" aria-hidden="true">${image(post)}</a><h3><a href="${link(post)}">${escapeHtml(post.title)}</a></h3><p class="author">${escapeHtml(attribution(post))}</p><time class="date" datetime="${escapeHtml(post.post_date)}">${date(post)}</time></article>`).join('');
  document.querySelector('#empty').hidden = filtered.length > 0;
  document.querySelector('#load-more').hidden = visible >= filtered.length;
  document.querySelector('#story-count').textContent = `${filtered.length} recent articles`;
  document.querySelector('#results-status').textContent = `${Math.min(visible, filtered.length)} of ${filtered.length} articles shown`;
}
async function init() {
  try {
    const response = await fetch('posts.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Could not load the article list');
    posts = (await response.json()).filter(post => !post.podcast && (post.path || safeUrl(post.url))).sort((a,b) => new Date(b.post_date) - new Date(a.post_date) || Number(b.id) - Number(a.id));
    if (!posts.length) throw new Error('No articles available');
    const latest = posts[0];
    document.querySelector('#hero').innerHTML = `${image(latest, true).replace('<img ', '<img class="hero-image" ')}<div class="hero-content"><p class="eyebrow"><span class="live-dot"></span> THE LATEST DISPATCH <span> / </span><time datetime="${escapeHtml(latest.post_date)}">${date(latest)}</time></p><h1 id="hero-title"><a href="${link(latest)}">${escapeHtml(latest.title)}</a></h1><p class="hero-author">${escapeHtml(attribution(latest))}</p><a class="hero-cta" href="${link(latest)}"><span aria-hidden="true">↗</span> Read the latest</a></div>`;
    document.querySelector('#spotlight-list').innerHTML = posts.slice(1,5).map(post => `<article class="spotlight-story"><div><h3><a href="${link(post)}">${escapeHtml(post.title)}</a></h3><time class="date" datetime="${escapeHtml(post.post_date)}">${date(post)}</time></div><a href="${link(post)}" tabindex="-1" aria-hidden="true">${image(post)}</a></article>`).join('');
    renderArticles();
  } catch (error) {
    // Keep the exported latest-story hero if the metadata request fails.
    document.querySelector('#load-more').hidden = true;
    console.error(error);
  }
}
document.querySelector('#query').addEventListener('input', () => { visible = 9; renderArticles(); });
document.querySelector('#search').addEventListener('submit', event => { event.preventDefault(); renderArticles(); });
document.querySelector('#load-more').addEventListener('click', () => { visible += 9; renderArticles(); });
document.querySelector('#year').textContent = new Date().getFullYear();
init();
