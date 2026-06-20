const HLS_SRC = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
const HLS_JS = "https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js";

function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

function initMobileNav() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}

function initScrollTop() {
  const btn = document.querySelector('[data-scroll-top]');
  if (!btn) return;
  const onScroll = () => btn.classList.toggle('show', window.scrollY > 500);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initHeroCarousel() {
  const track = document.querySelector('[data-carousel-track]');
  if (!track) return;
  const slides = Array.from(track.children);
  const prev = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  let index = 0;
  const go = (i) => {
    index = (i + slides.length) % slides.length;
    track.scrollTo({ left: slides[index].offsetLeft, behavior: 'smooth' });
  };
  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));
  let timer = window.setInterval(() => go(index + 1), 6000);
  track.addEventListener('mouseenter', () => window.clearInterval(timer));
  track.addEventListener('mouseleave', () => {
    timer = window.setInterval(() => go(index + 1), 6000);
  });
  track.addEventListener('scroll', () => {
    const width = track.clientWidth || 1;
    index = Math.round(track.scrollLeft / width);
  }, { passive: true });
}

function normalize(s) {
  return (s || '').toString().toLowerCase().trim();
}

function initCardFilters(scope = document) {
  const input = scope.querySelector('[data-filter-input]');
  const chips = Array.from(scope.querySelectorAll('[data-filter-chip]'));
  const items = Array.from(scope.querySelectorAll('[data-filter-item]'));
  if (!input || !items.length) return;

  let active = '';
  const apply = () => {
    const q = normalize(input.value);
    items.forEach((item) => {
      const hay = normalize(item.getAttribute('data-search-index'));
      const tags = normalize(item.getAttribute('data-tags'));
      const matchText = !q || hay.includes(q) || tags.includes(q);
      const matchChip = !active || normalize(item.getAttribute('data-category')) === active || tags.includes(active);
      item.style.display = (matchText && matchChip) ? '' : 'none';
    });
  };

  input.addEventListener('input', apply);
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const next = normalize(chip.getAttribute('data-filter-chip'));
      if (active === next) {
        active = '';
        chip.classList.remove('active');
      } else {
        active = next;
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
      }
      apply();
    });
  });
  apply();
}

function initHlsPlayers() {
  const videos = Array.from(document.querySelectorAll('video[data-hls]'));
  if (!videos.length) return;

  const ensureHlsJs = () => new Promise((resolve) => {
    if (window.Hls) return resolve(true);
    const existing = document.querySelector('script[data-hls-lib]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = HLS_JS;
    script.async = true;
    script.setAttribute('data-hls-lib', '1');
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  ensureHlsJs().then(() => {
    videos.forEach((video) => {
      const src = video.getAttribute('data-hls') || HLS_SRC;
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video.dataset.hlsReady = '1';
        video._hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.dataset.hlsReady = '1';
      }
    });
  });

  document.querySelectorAll('[data-play-overlay]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.getAttribute('data-play-overlay'));
      if (!target) return;
      target.play().catch(() => {});
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

ready(() => {
  initMobileNav();
  initScrollTop();
  initHeroCarousel();
  initCardFilters();
  initHlsPlayers();
});
