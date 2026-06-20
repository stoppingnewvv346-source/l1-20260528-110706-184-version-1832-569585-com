(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeSlide = 0;
    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === activeSlide);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === activeSlide);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5500);
    }

    var query = new URLSearchParams(window.location.search).get('q') || '';
    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-filter]'));
    var empty = document.querySelector('[data-empty]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-chip]'));
    var currentChip = '';

    function normalize(text) {
      return String(text || '').trim().toLowerCase();
    }

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var keyword = normalize(filterInput ? filterInput.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var target = normalize(card.getAttribute('data-filter'));
        var hitKeyword = !keyword || target.indexOf(keyword) !== -1;
        var hitChip = !currentChip || target.indexOf(normalize(currentChip)) !== -1;
        var show = hitKeyword && hitChip;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (filterInput) {
      if (query) {
        filterInput.value = query;
      }
      filterInput.addEventListener('input', applyFilter);
      applyFilter();
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        if (currentChip === chip.getAttribute('data-chip')) {
          currentChip = '';
        } else {
          currentChip = chip.getAttribute('data-chip') || '';
          chip.classList.add('active');
        }
        applyFilter();
      });
    });

    function connectVideo(video) {
      if (!video || video.getAttribute('data-ready') === '1') {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var start = function () {
        connectVideo(video);
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        if (video) {
          var play = video.play();
          if (play && typeof play.catch === 'function') {
            play.catch(function () {
              if (overlay) {
                overlay.classList.remove('is-hidden');
              }
            });
          }
        }
      };
      if (overlay) {
        overlay.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
      }
    });
  });
})();
