(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"movie-cover\" href=\"" + movie.file + "\"><img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"duration\">45:00</span></a>" +
            "<div class=\"movie-info\"><h3><a href=\"" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine || "") + "</p>" +
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region || "") + "</span><span>" + escapeHtml(movie.year || "") + "</span><span>" + escapeHtml(movie.type || "") + "</span></div>" +
            "<div class=\"tag-row\">" + tags + "</div></div></article>";
    }

    function escapeHtml(text) {
        return String(text || "").replace(/[&<>\"]/g, function (ch) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[ch];
        });
    }

    ready(function () {
        var input = document.getElementById("searchInput");
        var results = document.getElementById("searchResults");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input) {
            input.value = initial;
        }
        var run = function () {
            if (!results || !window.SEARCH_MOVIES) {
                return;
            }
            var query = input ? input.value.trim().toLowerCase() : initial.trim().toLowerCase();
            var source = window.SEARCH_MOVIES;
            var list = query ? source.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
                return haystack.indexOf(query) !== -1;
            }).slice(0, 120) : source.slice(0, 24);
            results.innerHTML = list.map(card).join("");
        };
        if (input) {
            input.addEventListener("input", run);
        }
        run();
    });
})();
