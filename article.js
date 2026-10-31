const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const formatDate = new Intl.DateTimeFormat('en', {month:'long',day:'numeric',year:'numeric'});
const articleLink = post => `article.html?slug=${encodeURIComponent(post.slug)}`;
function https(value) { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } }
function subtitle(post) { return post.subtitle || (post.original_author && post.original_author !== 'Paulo Santos' && post.source !== 'SubstackArchive' ? `Based on an article by ${post.original_author}` : 'By Paulo Santos'); }
function imageIdentity(value) {
  try {
    let url = new URL(value);
    // Substack wraps the same source image in different resize/format URLs.
    if (url.hostname === 'substackcdn.com' && url.pathname.startsWith('/image/fetch/')) {
      const source = decodeURIComponent(url.pathname).match(/https?:\/\/.+$/);
      if (source) url = new URL(source[0]);
    }
    return url.origin + url.pathname;
  } catch { return null; }
}
function removeOpeningCoverDuplicate(fragment, coverUrl) {
  const image = fragment.querySelector('img');
  const cover = imageIdentity(coverUrl);
  if (!image || !cover || imageIdentity(image.getAttribute('src')) !== cover) return;
  const preceding = document.createRange();
  preceding.setStart(fragment, 0);
  preceding.setEndBefore(image);
  if (preceding.toString().trim()) return;
  let parent = image.parentElement;
  image.remove();
  // Discard only empty image wrappers. Keep captions, text and other media.
  while (parent && !parent.textContent.trim() && !parent.querySelector('img,video,audio,svg,hr')) {
    const next = parent.parentElement;
    parent.remove();
    parent = next;
  }
}
function updateProgress() {
  const body = document.querySelector('#article-body');
  if (!body) return;
  const start = body.getBoundingClientRect().top + window.scrollY;
  const length = Math.max(1, body.offsetHeight - window.innerHeight);
  document.querySelector('#reading-progress').style.width = `${Math.min(100,Math.max(0,(window.scrollY-start)/length*100))}%`;
}
async function initArticle() {
  try {
    const response = await fetch('articles.json');
    if (!response.ok) throw new Error('Article data unavailable');
    const articles = (await response.json()).sort((a,b) => new Date(b.post_date)-new Date(a.post_date));
    const slug = new URLSearchParams(location.search).get('slug');
    const post = slug ? articles.find(article => article.slug === slug) : articles[0];
    if (!post) { document.querySelector('#article-main').innerHTML = '<div class="article-loading article-error"><h1>Article not found</h1><p>This story isn’t part of the current preview.</p><a class="text-link" href="archive.html">Return to the articles →</a></div>'; return; }
    document.title = `${post.title} — Systemic Error`;
    document.querySelector('meta[name="description"]').content = post.title;
    document.querySelector('#article-main').innerHTML = `<article><header class="article-header"><a class="back-link" href="archive.html">← All stories</a><p class="eyebrow">SYSTEMIC ERROR / COMMENTARY</p><h1>${esc(post.title)}</h1><p class="article-subtitle">${esc(subtitle(post))}</p><div class="article-meta"><span class="author-name">Paulo Santos</span><span class="meta-dot"></span><time datetime="${esc(post.post_date)}">${formatDate.format(new Date(post.post_date))}</time><span class="meta-dot"></span><span>${Number(post.reading_minutes)} min read</span><button id="copy-link" class="share-button" type="button">Copy link ↗</button><span id="share-status" class="sr-only" role="status"></span></div></header><figure class="article-cover"><img src="${esc(https(post.cover_image))}" alt="" fetchpriority="high">${post.image_credit ? `<figcaption>${esc(post.image_credit)}</figcaption>` : ''}</figure><div class="article-layout"><aside class="article-toc" aria-label="Table of contents"><div class="toc-inner"><p class="eyebrow">IN THIS ARTICLE</p><nav id="toc"></nav></div></aside><div id="article-body" class="article-body"></div></div><div class="article-end"><p class="article-signoff">This isn’t a glitch.<br>It’s the design.</p><p>Written and published by <strong>Paulo Santos</strong> for Systemic Error.</p><a class="text-link back-to-stories" href="archive.html">← Back to all stories</a></div></article><section class="next-stories" aria-labelledby="next-heading"><p class="eyebrow">KEEP READING</p><h2 id="next-heading">More from Systemic Error</h2><div class="next-grid"></div></section>`;
    const body = document.querySelector('#article-body');
    // HTML was sanitized at export. Strip executable elements/attributes again
    // before inserting so future data updates cannot introduce active content.
    const template = document.createElement('template');
    template.innerHTML = post.body;
    template.content.querySelectorAll('script,style,iframe,object,embed,form,input,button,link,meta').forEach(node => node.remove());
    template.content.querySelectorAll('*').forEach(node => [...node.attributes].forEach(attr => {
      if (attr.name.startsWith('on') || attr.name === 'style' || attr.name === 'srcdoc' || (['href','src'].includes(attr.name) && !/^(https?:|mailto:|#)/i.test(attr.value))) node.removeAttribute(attr.name);
    }));
    removeOpeningCoverDuplicate(template.content, post.cover_image);
    body.append(template.content);
    if (https(post.source_url)) {
      const credit = document.createElement('p');
      const sourceLink = document.createElement('a');
      credit.append('Source: ');
      sourceLink.href = https(post.source_url);
      sourceLink.textContent = post.source || 'Original reporting';
      sourceLink.target = '_blank'; sourceLink.rel = 'noopener';
      credit.append(sourceLink);
      document.querySelector('.article-end').prepend(credit);
    }
    body.querySelectorAll('img').forEach(img => { img.loading = 'lazy'; img.decoding = 'async'; });
    const toc = document.querySelector('#toc');
    body.querySelectorAll('h2,h3').forEach((heading,index) => {
      heading.id = `section-${index+1}`;
      const anchor = document.createElement('a'); anchor.href = `#${heading.id}`; anchor.textContent = heading.textContent;
      toc.append(anchor);
    });
    if (!toc.children.length) document.querySelector('.article-toc').hidden = true;
    document.querySelector('.next-grid').innerHTML = articles.filter(article => article.id !== post.id).slice(0,3).map(article => `<article class="article-card"><a class="article-image" href="${articleLink(article)}" tabindex="-1" aria-hidden="true"><img src="${esc(https(article.cover_image))}" alt="" loading="lazy"></a><h3><a href="${articleLink(article)}">${esc(article.title)}</a></h3><p class="author">${esc(subtitle(article))}</p><time class="date" datetime="${esc(article.post_date)}">${formatDate.format(new Date(article.post_date))}</time></article>`).join('');
    document.querySelector('#copy-link').addEventListener('click', async event => {
      const button = event.currentTarget;
      try { await navigator.clipboard.writeText(location.href); button.textContent = 'Copied ✓'; document.querySelector('#share-status').textContent = 'Article link copied'; }
      catch { document.querySelector('#share-status').textContent = 'Copy the address from your browser to share this article.'; }
    });
    updateProgress();
  } catch (error) { document.querySelector('#article-main').innerHTML = '<div class="article-loading article-error"><h1>Unable to load this article</h1><p>Please refresh to try again.</p><a class="text-link" href="./">Return home →</a></div>'; console.error(error); }
}
window.addEventListener('scroll',updateProgress,{passive:true});
window.addEventListener('resize',updateProgress);
document.querySelector('#year').textContent = new Date().getFullYear();
initArticle();
