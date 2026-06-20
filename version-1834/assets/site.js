(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.hasAttribute("hidden");
                if (open) {
                    panel.removeAttribute("hidden");
                } else {
                    panel.setAttribute("hidden", "");
                }
                toggle.setAttribute("aria-expanded", String(open));
            });
        }

        var slider = document.getElementById("heroSlider");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var current = 0;
            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }
        }

        var textInput = document.getElementById("pageFilter");
        var yearInput = document.getElementById("yearFilter");
        var genreInput = document.getElementById("genreFilter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));
        var applyFilter = function () {
            var text = textInput ? textInput.value.trim().toLowerCase() : "";
            var year = yearInput ? yearInput.value : "";
            var genre = genreInput ? genreInput.value : "";
            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardGenre = card.getAttribute("data-genre") || "";
                var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
                var matchText = !text || title.indexOf(text) !== -1 || cardRegion.indexOf(text) !== -1 || cardGenre.toLowerCase().indexOf(text) !== -1;
                var matchYear = !year || cardYear === year;
                var matchGenre = !genre || cardGenre.indexOf(genre) !== -1;
                card.hidden = !(matchText && matchYear && matchGenre);
            });
        };
        [textInput, yearInput, genreInput].forEach(function (input) {
            if (input) {
                input.addEventListener("input", applyFilter);
                input.addEventListener("change", applyFilter);
            }
        });
    });
})();
