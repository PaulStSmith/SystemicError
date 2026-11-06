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
