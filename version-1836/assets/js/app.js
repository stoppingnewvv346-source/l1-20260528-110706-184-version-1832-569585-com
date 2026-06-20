(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    setupHero();
    setupFilters();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));

    bars.forEach(function (bar) {
      var scope = bar.closest("section") || document;
      var container = scope.querySelector("[data-card-container]") || document.querySelector("[data-card-container]");
      var cards = container ? Array.prototype.slice.call(container.querySelectorAll(".filter-card")) : [];
      var searchInput = bar.querySelector("[data-search-input]");
      var regionSelect = bar.querySelector("[data-filter-region]");
      var typeSelect = bar.querySelector("[data-filter-type]");
      var yearSelect = bar.querySelector("[data-filter-year]");
      var sortSelect = bar.querySelector("[data-sort-select]");
      var clearButton = bar.querySelector("[data-clear-filters]");
      var emptyState = scope.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (searchInput && query) {
        searchInput.value = query;
      }

      function match(card) {
        var text = card.getAttribute("data-search-text") || "";
        var title = card.getAttribute("data-title") || "";
        var region = card.getAttribute("data-region") || "";
        var type = card.getAttribute("data-type") || "";
        var year = card.getAttribute("data-year") || "";
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var wantedRegion = regionSelect ? regionSelect.value : "";
        var wantedType = typeSelect ? typeSelect.value : "";
        var wantedYear = yearSelect ? yearSelect.value : "";

        if (keyword && text.indexOf(keyword) === -1 && title.toLowerCase().indexOf(keyword) === -1) {
          return false;
        }
        if (wantedRegion && region !== wantedRegion) {
          return false;
        }
        if (wantedType && type !== wantedType) {
          return false;
        }
        if (wantedYear && year !== wantedYear) {
          return false;
        }
        return true;
      }

      function sortCards() {
        if (!container || !sortSelect) {
          return;
        }

        var value = sortSelect.value;
        var sorted = cards.slice();

        if (value === "views") {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
          });
        }

        if (value === "year") {
          sorted.sort(function (a, b) {
            return Number((b.getAttribute("data-year") || "").replace(/\D/g, "") || 0) - Number((a.getAttribute("data-year") || "").replace(/\D/g, "") || 0);
          });
        }

        if (value === "title") {
          sorted.sort(function (a, b) {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
          });
        }

        sorted.forEach(function (card) {
          container.appendChild(card);
        });
      }

      function apply() {
        var visible = 0;
        sortCards();
        cards.forEach(function (card) {
          var ok = match(card);
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      [searchInput, regionSelect, typeSelect, yearSelect, sortSelect].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });

      if (clearButton) {
        clearButton.addEventListener("click", function () {
          if (searchInput) {
            searchInput.value = "";
          }
          if (regionSelect) {
            regionSelect.value = "";
          }
          if (typeSelect) {
            typeSelect.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          if (sortSelect) {
            sortSelect.value = "default";
          }
          apply();
        });
      }

      apply();
    });
  }
})();
