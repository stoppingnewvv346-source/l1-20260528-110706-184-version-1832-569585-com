(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    var setSlide = function (index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setSlide(active + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (filter) {
    var input = filter.querySelector('[data-local-filter-input]');
    var clear = filter.querySelector('[data-local-filter-clear]');
    var list = document.querySelector('[data-filter-list]');

    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var apply = function () {
      var term = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-category') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden-card', term && haystack.indexOf(term) === -1);
      });
    };

    input.addEventListener('input', apply);

    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        apply();
        input.focus();
      });
    }
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var stream = player.getAttribute('data-stream-url');
    var loaded = false;
    var hls = null;

    if (!video || !button || !stream) {
      return;
    }

    var showStatus = function (message) {
      if (!status) {
        return;
      }
      status.textContent = message;
      status.classList.add('show');
      window.setTimeout(function () {
        status.classList.remove('show');
      }, 2600);
    };

    var loadStream = function () {
      if (loaded) {
        return;
      }
      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showStatus('视频加载遇到问题，请稍后重试');
          }
        });
      } else {
        video.src = stream;
      }
    };

    var playVideo = function () {
      loadStream();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showStatus('点击播放器即可继续播放');
        });
      }
    };

    button.addEventListener('click', function () {
      playVideo();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      player.classList.remove('is-playing');
    });

    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });

  document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var player = document.querySelector('[data-player]');
      if (!player) {
        return;
      }
      event.preventDefault();
      player.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      var button = player.querySelector('[data-play-button]');
      if (button) {
        button.click();
      }
    });
  });
})();
