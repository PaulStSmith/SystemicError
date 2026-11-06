// Shared analytics applies to existing pages and every future export.
(() => {
  if (document.querySelector('script[data-systemic-analytics]')) return;
  const tag = document.createElement('script');
  tag.dataset.systemicAnalytics = '';
  tag.async = true;
  tag.src = new URL('analytics.js', document.currentScript.src).href;
  document.head.append(tag);
})();
const archiveEsc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const archiveDate = new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:'numeric',timeZone:'America/Sao_Paulo'});
const archiveDateParts = new Intl.DateTimeFormat('en',{year:'numeric',month:'2-digit',timeZone:'America/Sao_Paulo'});
const pageSize = 12;
let library = [];
function dateParts(post) { return Object.fromEntries(archiveDateParts.formatToParts(new Date(post.post_date)).filter(part => part.type !== 'literal').map(part => [part.type,part.value])); }
function archiveUrl(page) { const params = new URLSearchParams(); for (const [key,id] of [['q','archive-query'],['year','archive-year'],['month','archive-month'],['sort','archive-sort']]) { const value=document.getElementById(id).value; if(value && !(key==='sort' && value==='newest')) params.set(key,value); } if(page>1) params.set('page',page); return `archive.html${params.size?'?'+params:''}`; }
function renderArchive(requestedPage=1, push=false) {
  const query=document.getElementById('archive-query').value.trim().toLocaleLowerCase();
  const year=document.getElementById('archive-year').value, month=document.getElementById('archive-month').value, sort=document.getElementById('archive-sort').value;
  const results=library.filter(post => { const parts=dateParts(post); return (!year || parts.year===year) && (!month || parts.month===month) && `${post.title} ${post.subtitle||''} ${(post.authors||[]).join(' ')}`.toLocaleLowerCase().includes(query); });
  results.sort((a,b) => sort==='title'?a.title.localeCompare(b.title):sort==='oldest'?new Date(a.post_date)-new Date(b.post_date):new Date(b.post_date)-new Date(a.post_date));
  const pages=Math.max(1,Math.ceil(results.length/pageSize)), page=Math.max(1,Math.min(pages,Number(requestedPage)||1)), start=(page-1)*pageSize;
  if(push) history.pushState(null,'',archiveUrl(page));
  document.getElementById('archive-count').textContent=`${results.length.toLocaleString()} ${results.length===1?'article':'articles'}${query||year||month?' found':' available'}`;
  document.getElementById('archive-range').textContent=results.length?`${start+1}–${Math.min(start+pageSize,results.length)} of ${results.length.toLocaleString()}`:'';
  document.getElementById('archive-empty').hidden=results.length>0;
  document.getElementById('archive-grid').innerHTML=results.slice(start,start+pageSize).map(post => `<article class="article-card"><a class="article-image" href="${archiveEsc(post.path)}" tabindex="-1" aria-hidden="true"><img src="${archiveEsc(post.cover_image==='assets/image-unavailable.svg'?post.cover_image:/^(https:\/\/|assets\/images\/(?:manual\/)?[a-f0-9]+\.[a-z]+$)/i.test(post.cover_image||'')?post.cover_image:'')}" alt="" loading="lazy"></a><h3><a href="${archiveEsc(post.path)}">${archiveEsc(post.title)}</a></h3><p class="author">${archiveEsc(post.subtitle || `By ${(post.authors||['Paulo Santos']).join(', ')}`)}</p><time class="date" datetime="${archiveEsc(post.post_date)}">${archiveDate.format(new Date(post.post_date))}</time></article>`).join('');
  const pagination=document.getElementById('archive-pagination'); pagination.hidden=pages<=1;
  const pageLink=(n,label)=>`<a href="${archiveEsc(archiveUrl(n))}" data-page="${n}" ${n===page?'aria-current="page"':''} aria-label="${label||'Page '+n}">${label||n}</a>`;
  let html=page>1?pageLink(page-1,'← Previous'):'<span class="pagination-disabled">← Previous</span>';
  let last=0; for(let n=1;n<=pages;n++) { if(n!==1 && n!==pages && Math.abs(n-page)>1) continue; if(last && n-last>1) html+='<span class="pagination-gap">…</span>'; html+=pageLink(n); last=n; }
  html+=page<pages?pageLink(page+1,'Next →'):'<span class="pagination-disabled">Next →</span>'; pagination.innerHTML=html;
}
function restoreArchive() { const params=new URLSearchParams(location.search); for(const [key,id] of [['q','archive-query'],['year','archive-year'],['month','archive-month'],['sort','archive-sort']]) {const control=document.getElementById(id);control.value=params.get(key)||(key==='sort'?'newest':'');if(control.tagName==='SELECT' && control.selectedIndex<0) control.selectedIndex=0;} renderArchive(params.get('page')); }
async function loadArchive() {
  try {
    const response=await fetch('archive-data/index.json'); if(!response.ok) throw new Error('Archive unavailable');
    const manifest=await response.json();
    for(let i=0;i<manifest.chunks.length;i+=4){const batches=await Promise.all(manifest.chunks.slice(i,i+4).map(async path=>{const response=await fetch(path);if(!response.ok)throw new Error('Archive chunk unavailable');return response.json();}));library.push(...batches.flat());}
    if(library.length!==manifest.total)throw new Error('Incomplete archive index');
    [...new Set(library.map(post=>dateParts(post).year))].sort().reverse().forEach(year=>document.getElementById('archive-year').add(new Option(year,year)));
    for(let n=1;n<=12;n++) document.getElementById('archive-month').add(new Option(new Intl.DateTimeFormat('en',{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2026,n-1,1))),String(n).padStart(2,'0')));
    restoreArchive();
    document.getElementById('search').addEventListener('submit',event=>{event.preventDefault();renderArchive(1,true);});
    document.getElementById('archive-query').addEventListener('input',()=>renderArchive(1,true));
    for(const id of ['archive-year','archive-month','archive-sort']) document.getElementById(id).addEventListener('change',()=>renderArchive(1,true));
    document.getElementById('clear-filters').addEventListener('click',()=>{document.getElementById('search').reset();renderArchive(1,true);});
    document.getElementById('archive-pagination').addEventListener('click',event=>{const anchor=event.target.closest('a[data-page]');if(!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;event.preventDefault();renderArchive(Number(anchor.dataset.page),true);document.getElementById('archive-results').scrollIntoView({behavior:'smooth'});});
    window.addEventListener('popstate',restoreArchive);
  } catch(error) {document.getElementById('archive-count').textContent='The archive could not be loaded. Please refresh to try again.';console.error(error);}
}
document.getElementById('year').textContent=new Date().getFullYear();
loadArchive();

// Subscription and privacy links also reach existing article pages.
(() => {
  if (document.querySelector('script[data-systemic-publication]')) return;
  const tag = document.createElement('script');
  tag.dataset.systemicPublication = '';
  tag.src = new URL('publication.js', document.currentScript.src).href;
  document.head.append(tag);
})();
