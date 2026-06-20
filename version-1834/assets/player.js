(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        document.querySelectorAll(".player").forEach(function (player) {
            var video = player.querySelector("video");
            var source = video ? video.querySelector("source") : null;
            var button = player.querySelector(".play-overlay");
            if (!video || !source || !button) {
                return;
            }
            var url = source.getAttribute("src");
            var started = false;
            var hls = null;
            var start = function () {
                if (!started) {
                    if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                        video.src = url;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(url);
                        hls.attachMedia(video);
                    } else {
                        video.src = url;
                    }
                    started = true;
                }
                button.setAttribute("hidden", "");
                video.controls = true;
                var playTask = video.play();
                if (playTask && typeof playTask.catch === "function") {
                    playTask.catch(function () {});
                }
            };
            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    });
})();
