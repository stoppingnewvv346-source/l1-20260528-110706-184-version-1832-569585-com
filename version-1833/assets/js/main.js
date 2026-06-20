(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.slider-dot'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let current = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('active');
    }));
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  const searchInput = document.querySelector('[data-search-input]');
  const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const emptyState = document.querySelector('[data-empty-state]');
  let activeFilter = 'all';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function matchFilter(card) {
    if (activeFilter === 'all') {
      return true;
    }

    const region = card.dataset.region || '';
    const genre = card.dataset.genre || '';
    const title = card.dataset.title || '';
    const text = region + ' ' + genre + ' ' + title;
    return text.indexOf(activeFilter) !== -1;
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    const query = normalize(searchInput ? searchInput.value : '');
    let visibleCount = 0;

    cards.forEach(function (card) {
      const text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.textContent
      ].join(' '));
      const isVisible = text.indexOf(query) !== -1 && matchFilter(card);
      card.style.display = isVisible ? '' : 'none';
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.dataset.filterValue || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilters();
    });
  });
})();
