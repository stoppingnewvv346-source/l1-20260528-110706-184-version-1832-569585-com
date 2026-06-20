
(function () {
  const d = document;
  const w = window;

  function qs(sel, root = d) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = d) {
    return Array.from(root.querySelectorAll(sel));
  }

  function params() {
    return new URLSearchParams(w.location.search);
  }

  function norm(text) {
    return (text || "")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "")
      .trim();
  }

  function hashString(str) {
    let h = 0;
    const s = String(str || "");
    for (let i = 0; i < s.length; i += 1) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  const coverPalette = [
    ["#0f172a", "#7c2d12", "#f59e0b"],
    ["#111827", "#1d4ed8", "#38bdf8"],
    ["#1c1917", "#9a3412", "#fdba74"],
    ["#172554", "#7c3aed", "#f472b6"],
    ["#082f49", "#0f766e", "#34d399"],
    ["#1f2937", "#b45309", "#fbbf24"],
    ["#3f3f46", "#be123c", "#fb7185"],
    ["#111827", "#166534", "#84cc16"],
    ["#1e1b4b", "#4f46e5", "#c4b5fd"],
    ["#292524", "#ea580c", "#fdba74"],
  ];

  function wrapTitle(title, maxChars) {
    const chars = String(title || "").replace(/\s+/g, "").split("");
    const lines = [];
    let line = "";
    chars.forEach((ch) => {
      const next = line + ch;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = ch;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    return lines.slice(0, 3);
  }

  function posterSvg(movie) {
    const idx = hashString(movie.id || movie.title) % coverPalette.length;
    const [bg1, bg2, accent] = coverPalette[idx];
    const lines = wrapTitle(movie.title || "", 8);
    const tspans = lines.map((line, i) =>
      `<tspan x="56" dy="${i === 0 ? 0 : 58}">${String(line)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</tspan>`
    ).join("");
    const genre = (movie.genre || movie.category || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="480" height="720" viewBox="0 0 480 720">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${bg1}"/>
            <stop offset="100%" stop-color="${bg2}"/>
          </linearGradient>
          <radialGradient id="r" cx="50%" cy="30%" r="80%">
            <stop offset="0%" stop-color="${accent}" stop-opacity="0.36"/>
            <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
          </radialGradient>
          <filter id="blur">
            <feGaussianBlur stdDeviation="26"/>
          </filter>
        </defs>
        <rect width="480" height="720" rx="32" fill="url(#g)"/>
        <rect width="480" height="720" rx="32" fill="url(#r)"/>
        <circle cx="392" cy="112" r="88" fill="${accent}" fill-opacity="0.22" filter="url(#blur)"/>
        <circle cx="88" cy="600" r="110" fill="#ffffff" fill-opacity="0.06" filter="url(#blur)"/>
        <path d="M0 560C110 500 160 640 270 592C347 559 370 470 480 430V720H0Z" fill="#000000" fill-opacity="0.18"/>
        <path d="M0 120C88 58 152 152 250 118C323 93 377 18 480 72V0H0Z" fill="#ffffff" fill-opacity="0.08"/>
        <text x="56" y="92" fill="#fde68a" font-size="26" font-family="Noto Sans CJK SC, Noto Sans CJK, sans-serif" font-weight="700">亚洲影视大全</text>
        <text x="56" y="150" fill="#ffffff" font-size="18" font-family="Noto Sans CJK SC, Noto Sans CJK, sans-serif" opacity="0.82">${genre || "精选推荐"}</text>
        <text x="56" y="218" fill="#ffffff" font-size="64" font-family="Noto Sans CJK SC, Noto Sans CJK, sans-serif" font-weight="900">${tspans}</text>
        <rect x="56" y="560" width="368" height="84" rx="24" fill="#000000" fill-opacity="0.30" stroke="#ffffff" stroke-opacity="0.12"/>
        <text x="84" y="604" fill="#ffffff" font-size="24" font-family="Noto Sans CJK SC, Noto Sans CJK, sans-serif" font-weight="700">${movie.year || ""}</text>
        <text x="84" y="636" fill="#fde68a" font-size="18" font-family="Noto Sans CJK SC, Noto Sans CJK, sans-serif">${(movie.genre || movie.category || "").slice(0, 16)}</text>
        <text x="384" y="612" text-anchor="middle" fill="#ffffff" font-size="18" font-family="Noto Sans CJK SC, Noto Sans CJK, sans-serif" font-weight="700">HOT</text>
      </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function posterUrl(movie) {
    return movie.poster && movie.poster.length ? movie.poster : posterSvg(movie);
  }

  function cardHtml(movie, extraClass = "") {
    const url = movie.url || movie.detailUrl || "#";
    const title = movie.title || "";
    const year = movie.year || "";
    const genre = movie.genre || movie.category || "";
    const desc = movie.oneLine || movie.summary || "";
    const score = movie.score ? Number(movie.score).toFixed(1) : "";
    const img = posterUrl(movie);
    return `
      <a class="movie-card ${extraClass}" href="${url}" data-movie-card data-title="${escapeAttr(title)}" data-keywords="${escapeAttr([title, genre, movie.region, movie.type, movie.oneLine, movie.summary, movie.tags || ""].join(" "))}" data-year="${escapeAttr(year)}" data-score="${escapeAttr(movie.score || 0)}" data-category="${escapeAttr(movie.category || "")}">
        <div class="poster">
          <img src="${img}" alt="${escapeAttr(title)}" loading="lazy">
          <div class="meta-top">
            <span class="pill">${escapeHtml(movie.category || "推荐")}</span>
            <span class="year-pill">${escapeHtml(year)}</span>
          </div>
          <div class="meta-bot">
            <span class="type-pill">${escapeHtml(movie.type || "")}</span>
            <span class="rank-pill">${escapeHtml(movie.id || "")}</span>
          </div>
        </div>
        <div class="body">
          <h3 class="title">${escapeHtml(title)}</h3>
          <p class="subtitle">${escapeHtml(desc)}</p>
          <div class="footer">
            <span>${escapeHtml(genre)}</span>
            <span class="score">${score ? "评分 " + score : ""}</span>
          </div>
        </div>
      </a>
    `;
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(text) {
    return escapeHtml(text).replace(/'/g, "&#39;");
  }

  function initHeaderControls() {
    const searchToggle = qs("[data-toggle-search]");
    const menuToggle = qs("[data-toggle-menu]");
    const catToggle = qs("[data-toggle-categories]");
    const searchBar = qs("#searchbar");
    const mobileMenu = qs("#mobile-menu");
    const catMenu = qs("#category-menu");

    if (searchToggle && searchBar) {
      searchToggle.addEventListener("click", () => {
        searchBar.classList.toggle("open");
        const input = qs(".searchinput", searchBar);
        if (searchBar.classList.contains("open") && input) {
          setTimeout(() => input.focus(), 0);
        }
      });
    }
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("open");
      });
    }
    if (catToggle && catMenu) {
      catToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        catMenu.classList.toggle("open");
      });
      document.addEventListener("click", (e) => {
        if (!catMenu.contains(e.target) && !catToggle.contains(e.target)) {
          catMenu.classList.remove("open");
        }
      });
    }
  }

  function initHeroCarousel() {
    const carousel = qs(".hero-carousel");
    if (!carousel) return;
    const slides = qsa(".hero-slide", carousel);
    const dotsWrap = qs(".hero-dots", carousel);
    if (!slides.length) return;

    let current = 0;
    const dots = slides.map((_, i) => {
      const btn = d.createElement("button");
      btn.className = "hero-dot" + (i === 0 ? " active" : "");
      btn.type = "button";
      btn.setAttribute("aria-label", `切换到第 ${i + 1} 张`);
      btn.addEventListener("click", () => go(i));
      dotsWrap && dotsWrap.appendChild(btn);
      return btn;
    });

    function go(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle("active", idx === current));
      dots.forEach((dot, idx) => dot.classList.toggle("active", idx === current));
    }

    let timer = w.setInterval(() => go(current + 1), 4200);
    carousel.addEventListener("mouseenter", () => w.clearInterval(timer));
    carousel.addEventListener("mouseleave", () => {
      timer = w.setInterval(() => go(current + 1), 4200);
    });
  }

  function filterCards(container, query, sortMode) {
    const cards = qsa("[data-movie-card]", container);
    const q = norm(query);
    cards.forEach((card) => {
      const hay = norm(card.dataset.keywords || card.dataset.title || "");
      const show = !q || hay.includes(q);
      card.style.display = show ? "" : "none";
    });

    const visible = cards.filter((c) => c.style.display !== "none");
    if (sortMode && visible.length > 1) {
      const frag = d.createDocumentFragment();
      const sorted = [...visible].sort((a, b) => {
        if (sortMode === "latest") {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0) || Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        }
        if (sortMode === "popular") {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0) || Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        return 0;
      });
      sorted.forEach((card) => frag.appendChild(card));
      container.appendChild(frag);
    }
    const empty = qs("[data-empty]", container.parentElement || d);
    if (empty) {
      empty.classList.toggle("hidden", visible.length !== 0);
    }
  }

  function initFilterableCards() {
    const containers = qsa("[data-filterable]");
    if (!containers.length) return;
    const p = params();
    const search = p.get("search") || "";
    const sort = p.get("sort") || "";
    const category = p.get("category") || "";

    containers.forEach((container) => {
      if (category) {
        qsa("[data-movie-card]", container).forEach((card) => {
          const cat = card.dataset.category || "";
          const show = cat === category || category === "全部";
          if (card.closest("[data-category-locked]")) return;
          if (!show && !search) card.style.display = "none";
        });
      }
      filterCards(container, search, sort);
    });

    if (search) {
      const q = qs("#search-query-text");
      if (q) q.textContent = search;
    }

    const sortButtons = qsa("[data-sort]");
    if (sortButtons.length) {
      sortButtons.forEach((btn) => {
        const mode = btn.dataset.sort;
        btn.classList.toggle("active", mode === sort || (!sort && mode === "popular"));
        btn.addEventListener("click", () => {
          const next = new URL(w.location.href);
          if (mode) next.searchParams.set("sort", mode);
          else next.searchParams.delete("sort");
          w.location.href = next.toString();
        });
      });
    }
  }

  function initDynamicSearch() {
    const panel = qs("#search-results");
    if (!panel || !w.MOVIE_CATALOG || !Array.isArray(w.MOVIE_CATALOG)) return;
    const p = params();
    const search = (p.get("search") || "").trim();
    if (!search) return;

    const q = norm(search);
    const matches = w.MOVIE_CATALOG.filter((movie) => {
      const hay = norm([
        movie.title,
        movie.genre,
        movie.type,
        movie.region,
        movie.category,
        movie.oneLine,
      ].join(" "));
      return hay.includes(q);
    }).slice(0, 24);

    const title = qs("[data-search-title]", panel);
    const count = qs("[data-search-count]", panel);
    const grid = qs("[data-search-grid]", panel);
    if (title) title.textContent = `“${search}” 的搜索结果`;
    if (count) count.textContent = String(matches.length);
    if (grid) {
      grid.innerHTML = matches.length
        ? matches.map((movie) => cardHtml(movie, "search-card")).join("")
        : '<div class="empty-state">没有找到匹配的作品，试试更换关键词。</div>';
    }
    panel.classList.remove("hidden");
  }

  function initDetailPlayer() {
    const player = qs("[data-player]");
    if (!player) return;
    const video = qs("video", player);
    if (!video) return;

    const toggle = qs("[data-toggle-sound]", player);
    if (toggle) {
      const sync = () => {
        toggle.textContent = video.muted ? "解除静音" : "静音";
      };
      sync();
      toggle.addEventListener("click", () => {
        video.muted = !video.muted;
        sync();
      });
    }
  }

  function initScrollTop() {
    const btn = qs("[data-scroll-top]");
    if (!btn) return;
    const onScroll = () => {
      btn.classList.toggle("hidden", w.scrollY < 600);
    };
    w.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", () => w.scrollTo({ top: 0, behavior: "smooth" }));
  }

  d.addEventListener("DOMContentLoaded", () => {
    initHeaderControls();
    initHeroCarousel();
    initFilterableCards();
    initDynamicSearch();
    initDetailPlayer();
    initScrollTop();
  });

  w.posterSvg = posterSvg;
  w.cardHtml = cardHtml;
})();
