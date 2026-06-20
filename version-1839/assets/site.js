async function loadCatalog() {
  if (window.__CATALOG__) return window.__CATALOG__;
  const prefix = window.__ASSET_PREFIX__ || '';
  const res = await fetch(prefix + 'assets/catalog.json');
  if (!res.ok) throw new Error('catalog load failed');
  window.__CATALOG__ = await res.json();
  return window.__CATALOG__;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function clampText(str, maxLen) {
  const s = String(str || '').trim();
  return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s;
}

function getParams() {
  return Object.fromEntries(new URLSearchParams(location.search).entries());
}

function setVideoSource(video, url) {
  if (!url) return false;
  if (window.Hls && window.Hls.isSupported() && url.includes('.m3u8')) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });
    hls.loadSource(url);
    hls.attachMedia(video);
    video.__hls = hls;
    return true;
  }
  video.src = url;
  return true;
}

function initPlayer() {
  const el = document.querySelector('[data-video-url]');
  const status = document.querySelector('[data-player-status]');
  const video = document.querySelector('#movie-video');
  if (!el || !video) return;
  const url = el.getAttribute('data-video-url') || '';
  if (url) {
    const ok = setVideoSource(video, url);
    if (ok) {
      if (status) status.textContent = '播放源已加载，可以直接播放。';
      const playBtn = document.querySelector('[data-play-btn]');
      if (playBtn) {
        playBtn.addEventListener('click', () => video.play().catch(()=>{}));
      }
    }
  } else {
    if (status) status.textContent = '当前素材未提供可直接播放的视频源。页面已保留播放器结构与 HLS 初始化逻辑。';
  }
}

function renderPosterCard(item, opts = {}) {
  const large = !!opts.large;
  const compact = !!opts.compact;
  const href = opts.href || `movies/${item.id}.html`;
  const badge = `${item.year} · ${item.type}`;
  const sub = `${item.region} · ${item.genre}`;
  const posterClass = large ? 'poster large' : compact ? 'poster compact' : 'poster';
  return `
    <a class="card group" href="${href}">
      <div class="${posterClass}" style="${item.posterStyle}">
        <div class="poster-badge">${escapeHtml(badge)}</div>
        <div class="poster-title">${escapeHtml(item.title)}</div>
        <div class="poster-sub">${escapeHtml(sub)}</div>
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">${escapeHtml(item.title)}</h3>
          ${item.videoUrl ? '<span class="tag">可播放</span>' : '<span class="tag">静态详情</span>'}
        </div>
        <p class="mt-2 text-sm text-slate-600 leading-6">${escapeHtml(clampText(item.oneLine, 68))}</p>
        <div class="mt-3 chip-row">
          <span class="tag">${escapeHtml(item.region)}</span>
          <span class="tag">${escapeHtml(item.type)}</span>
          <span class="tag">${escapeHtml(item.year)}</span>
        </div>
      </div>
    </a>`;
}

function initSearchPage() {
  const root = document.querySelector('[data-search-root]');
  if (!root) return;
  const qInput = document.querySelector('[data-q]');
  const regionSel = document.querySelector('[data-region]');
  const typeSel = document.querySelector('[data-type]');
  const yearFrom = document.querySelector('[data-year-from]');
  const yearTo = document.querySelector('[data-year-to]');
  const sortSel = document.querySelector('[data-sort]');
  const results = document.querySelector('[data-results]');
  const total = document.querySelector('[data-total]');
  const featured = document.querySelector('[data-search-featured]');

  function apply(items) {
    let filtered = items.slice();
    const q = (qInput?.value || '').trim().toLowerCase();
    const region = regionSel?.value || '';
    const type = typeSel?.value || '';
    const y1 = Number(yearFrom?.value || 0);
    const y2 = Number(yearTo?.value || 9999);
    if (q) {
      filtered = filtered.filter(item =>
        [item.title, item.region, item.type, item.genre, item.tags, item.oneLine, item.summary, item.review]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    if (region) filtered = filtered.filter(item => item.region === region);
    if (type) filtered = filtered.filter(item => item.type === type);
    if (y1) filtered = filtered.filter(item => Number(item.year) >= y1);
    if (y2 && y2 < 9999) filtered = filtered.filter(item => Number(item.year) <= y2);

    const sort = sortSel?.value || 'score';
    filtered.sort((a, b) => {
      if (sort === 'year-desc') return Number(b.year) - Number(a.year) || a.title.localeCompare(b.title, 'zh-Hans-CN');
      if (sort === 'year-asc') return Number(a.year) - Number(b.year) || a.title.localeCompare(b.title, 'zh-Hans-CN');
      if (sort === 'title') return a.title.localeCompare(b.title, 'zh-Hans-CN');
      return (b.score - a.score) || Number(b.year) - Number(a.year) || a.title.localeCompare(b.title, 'zh-Hans-CN');
    });

    if (total) total.textContent = filtered.length.toLocaleString();
    if (results) {
      results.innerHTML = filtered.slice(0, 120).map(item => renderPosterCard(item)).join('') || `
        <div class="content-block md:col-span-2 lg:col-span-3">
          <p class="text-slate-600">没有找到符合条件的影片。</p>
        </div>`;
    }
  }

  loadCatalog().then(items => {
    const params = getParams();
    if (params.q && qInput) qInput.value = params.q;
    const featuredItems = items.slice().sort((a,b) => b.score - a.score).slice(0, 8);
    if (featured) {
      featured.innerHTML = featuredItems.map(item => renderPosterCard(item, { compact: true, href: `movies/${item.id}.html` })).join('');
    }
    apply(items);
    [qInput, regionSel, typeSel, yearFrom, yearTo, sortSel].forEach(el => {
      if (el) el.addEventListener('input', () => apply(items));
      if (el) el.addEventListener('change', () => apply(items));
    });
  }).catch(err => {
    if (results) results.innerHTML = `<div class="content-block"><p class="text-red-600">搜索数据加载失败：${escapeHtml(err.message)}</p></div>`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPlayer();
  initSearchPage();
});
