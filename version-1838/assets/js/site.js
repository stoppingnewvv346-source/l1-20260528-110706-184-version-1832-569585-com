(function () {
  var header = document.querySelector('[data-header]');
  var searchButton = document.querySelector('[data-toggle-search]');
  var menuButton = document.querySelector('[data-toggle-menu]');
  var searchForm = document.querySelector('[data-header-search]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function onScroll() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (searchButton && searchForm) {
    searchButton.addEventListener('click', function () {
      searchForm.classList.toggle('is-open');
      var input = searchForm.querySelector('input');
      if (searchForm.classList.contains('is-open') && input) {
        input.focus();
      }
    });
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.poster-shell img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
      image.setAttribute('aria-hidden', 'true');
    });
  });

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        showSlide(Number(thumb.getAttribute('data-hero-thumb')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilterToolbars() {
    document.querySelectorAll('[data-filter-toolbar]').forEach(function (toolbar) {
      var scope = toolbar.parentElement.querySelector('[data-filter-scope]') || document.querySelector('[data-filter-scope]');
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
      var input = toolbar.querySelector('[data-filter-input]');
      var year = toolbar.querySelector('[data-filter-year]');
      var type = toolbar.querySelector('[data-filter-type]');
      var count = toolbar.querySelector('[data-filter-count]');

      function applyFilters() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (yearValue && cardYear.indexOf(yearValue) === -1) {
            matched = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '显示 ' + visible + ' / ' + cards.length;
        }
      }

      [input, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applyFilters);
          element.addEventListener('change', applyFilters);
        }
      });
      applyFilters();
    });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-play]');
      var status = player.querySelector('[data-player-status]');
      var loaded = false;
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function loadSource() {
        if (loaded) {
          return;
        }
        loaded = true;

        var hlsSource = video.getAttribute('data-hls');
        var fallbackSource = video.getAttribute('data-fallback');

        if (hlsSource && window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(hlsSource);
          hlsInstance.attachMedia(video);
          setStatus('播放源已绑定：HLS m3u8（HLS.js）。');
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && fallbackSource) {
              hlsInstance.destroy();
              video.src = fallbackSource;
              setStatus('HLS 载入失败，已切换 MP4 备用源。');
            }
          });
          return;
        }

        if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsSource;
          setStatus('播放源已绑定：Safari 原生 HLS m3u8。');
          return;
        }

        if (fallbackSource) {
          video.src = fallbackSource;
          setStatus('当前浏览器未启用 HLS，已使用 MP4 备用源播放。');
        }
      }

      button.addEventListener('click', function () {
        loadSource();
        video.controls = true;
        player.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
            setStatus('浏览器阻止自动播放，请再次点击播放器播放。');
          });
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
    });
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }
    var form = page.querySelector('form');
    var input = page.querySelector('input[name="q"]');
    var summary = page.querySelector('[data-search-summary]');
    var results = page.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function render(items, query) {
      if (!results || !summary) {
        return;
      }
      results.innerHTML = '';
      if (!query) {
        summary.textContent = '请输入关键词开始搜索。';
        return;
      }
      var matched = items.filter(function (item) {
        return item.search.indexOf(query.toLowerCase()) !== -1;
      }).slice(0, 120);

      summary.textContent = '关键词“' + query + '”找到 ' + matched.length + ' 条结果（最多展示 120 条）。';
      matched.forEach(function (item) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
          '<a class="movie-card__poster poster-shell" href="movies/' + item.id + '.html">',
          '<span class="poster-shell__fallback">' + item.title.slice(0, 8) + '</span>',
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
          '<span class="movie-card__badge">' + item.category + '</span>',
          '<span class="movie-card__year">' + item.year + '</span>',
          '</a>',
          '<div class="movie-card__body">',
          '<h3><a href="movies/' + item.id + '.html">' + item.title + '</a></h3>',
          '<p class="movie-card__meta">' + item.region + ' · ' + item.type + '</p>',
          '<p class="movie-card__desc">' + item.oneLine + '</p>',
          '</div>'
        ].join('');
        results.appendChild(article);
      });

      results.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
          image.style.opacity = '0';
        });
      });
    }

    fetch('assets/data/movies-search.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (items) {
        render(items, initialQuery.trim());
        if (form) {
          form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input ? input.value.trim() : '';
            var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
            window.history.replaceState(null, '', nextUrl);
            render(items, query);
          });
        }
      })
      .catch(function () {
        if (summary) {
          summary.textContent = '搜索数据载入失败，请检查 assets/data/movies-search.json 是否存在。';
        }
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilterToolbars();
    setupPlayers();
    setupSearchPage();
  });
})();
