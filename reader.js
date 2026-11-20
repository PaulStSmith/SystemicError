// Shared analytics applies to existing pages and every future export.
(() => {
  if (document.querySelector('script[data-systemic-analytics]')) return;
  const tag = document.createElement('script');
  tag.dataset.systemicAnalytics = '';
  tag.async = true;
  tag.src = new URL('analytics.js', document.currentScript.src).href;
  document.head.append(tag);
})();
document.querySelector('a.skip-link')?.setAttribute('href',location.pathname+'#article-body');
function updateReadingProgress(){const body=document.getElementById('article-body');if(!body)return;const start=body.getBoundingClientRect().top+scrollY;document.getElementById('reading-progress').style.width=`${Math.min(100,Math.max(0,(scrollY-start)/Math.max(1,body.offsetHeight-innerHeight)*100))}%`;}
addEventListener('scroll',updateReadingProgress,{passive:true});addEventListener('resize',updateReadingProgress);updateReadingProgress();
document.getElementById('copy-link')?.addEventListener('click',async event=>{const button=event.currentTarget;try{await navigator.clipboard.writeText(location.href);button.textContent='Copied ✓';document.getElementById('share-status').textContent='Article link copied';}catch{document.getElementById('share-status').textContent='Copy the address from your browser to share this article.';}});
// Related stories use the small homepage index, not the full article library.
(async()=>{try{
  const response=await fetch('posts.json');if(!response.ok)return;
  const stories=(await response.json()).filter(post=>/^articles\/[a-z0-9-]+\.html$/.test(post.path)&&new URL(post.path,document.baseURI).pathname!==location.pathname).slice(0,3);
  if(!stories.length)return;
  const section=document.createElement('section');section.className='next-stories';section.setAttribute('aria-labelledby','next-heading');
  const eyebrow=document.createElement('p');eyebrow.className='eyebrow';eyebrow.textContent='KEEP READING';
  const heading=document.createElement('h2');heading.id='next-heading';heading.textContent='More from Systemic Error';
  const grid=document.createElement('div');grid.className='next-grid';
  for(const post of stories){
    const card=document.createElement('article');card.className='article-card';
    if(/^(https:\/\/|assets\/images\/(?:manual\/)?[a-f0-9]+\.[a-z]+$)/i.test(post.cover_image||'')){const imageLink=document.createElement('a');imageLink.className='article-image';imageLink.href=post.path;imageLink.tabIndex=-1;imageLink.setAttribute('aria-hidden','true');const image=document.createElement('img');image.src=post.cover_image;image.alt='';image.loading='lazy';imageLink.append(image);card.append(imageLink);}
    const title=document.createElement('h3');const link=document.createElement('a');link.href=post.path;link.textContent=post.title;title.append(link);card.append(title);
    const author=document.createElement('p');author.className='author';author.textContent=post.subtitle;card.append(author);grid.append(card);
  }
  section.append(eyebrow,heading,grid);document.getElementById('article-main').append(section);
}catch{/* Article remains readable if related stories are unavailable. */}})();

// Subscription and privacy links also reach existing article pages.
(() => {
  if (document.querySelector('script[data-systemic-publication]')) return;
  const tag = document.createElement('script');
  tag.dataset.systemicPublication = '';
  tag.src = new URL('publication.js', document.currentScript.src).href;
  document.head.append(tag);
})();

// Load the optional right-column ad independently of article rendering.
(() => {
  if (document.querySelector('script[data-systemic-article-ads]')) return;
  const script = document.createElement('script');
  script.dataset.systemicArticleAds = '';
  script.src = new URL('article-ads.js', document.currentScript.src).href;
  script.async = true;
  document.head.append(script);
})();

// Initialize the comments container rendered on article pages only.
(() => {
  const widget = document.getElementById('zoomment');
  if (!widget) return;
  widget.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const script = document.createElement('script');
  script.src = 'https://cdn.zoomment.com/zoomment.min.js';
  script.async = true;
  widget.after(script);
})();

// Enhance existing and newly exported article covers without rebuilding pages.
(() => {
  const cover = document.querySelector('.article-cover');
  const source = cover?.querySelector('img');
  if (!source || !source.getAttribute('src')) return;
  const frame = document.createElement('div');
  frame.className = 'article-cover-frame';
  source.before(frame);
  frame.append(source);
  const enlarge = document.createElement('button');
  enlarge.type = 'button';
  enlarge.className = 'image-enlarge';
  enlarge.setAttribute('aria-label', 'Enlarge image');
  enlarge.title = 'Enlarge image';
  enlarge.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>';
  frame.append(enlarge);
  const dialog = document.createElement('dialog');
  dialog.className = 'image-lightbox';
  dialog.setAttribute('aria-label', 'Enlarged article image');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'image-lightbox-close';
  close.setAttribute('aria-label', 'Close enlarged image');
  close.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f87171" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>';
  const figure = document.createElement('figure');
  const image = document.createElement('img');
  const caption = document.createElement('figcaption');
  caption.id = 'image-lightbox-caption';
  figure.append(image, caption);
  dialog.append(close, figure);
  document.body.append(dialog);
  let previousOverflow;
  enlarge.addEventListener('click', () => {
    image.src = source.currentSrc || source.src;
    image.alt = source.alt;
    caption.textContent = source.alt.trim();
    caption.hidden = !caption.textContent;
    if (caption.hidden) dialog.removeAttribute('aria-describedby');
    else dialog.setAttribute('aria-describedby', caption.id);
    previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    close.focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    enlarge.focus({preventScroll:true});
  });
})();
