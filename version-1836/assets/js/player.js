(function () {
  var hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
  var hlsLoading = false;
  var hlsCallbacks = [];

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    hlsCallbacks.push(callback);

    if (hlsLoading) {
      return;
    }

    hlsLoading = true;
    var script = document.createElement("script");
    script.src = hlsScriptUrl;
    script.async = true;
    script.onload = function () {
      hlsLoading = false;
      hlsCallbacks.splice(0).forEach(function (item) {
        item();
      });
    };
    script.onerror = function () {
      hlsLoading = false;
      hlsCallbacks.splice(0).forEach(function (item) {
        item();
      });
    };
    document.head.appendChild(script);
  }

  function playVideo(video) {
    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function start(frame) {
    var video = frame.querySelector("video");
    var source = frame.getAttribute("data-m3u8");

    if (!video || !source) {
      return;
    }

    frame.classList.add("is-playing");

    if (video.getAttribute("data-ready") === "true") {
      playVideo(video);
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.setAttribute("data-ready", "true");
      playVideo(video);
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.setAttribute("data-ready", "true");
          playVideo(video);
        });
        hls.on(window.Hls.Events.ERROR, function () {
          if (!video.src) {
            video.src = source;
            video.setAttribute("data-ready", "true");
          }
        });
        frame.hlsPlayer = hls;
      } else {
        video.src = source;
        video.setAttribute("data-ready", "true");
        playVideo(video);
      }
    });
  }

  function setup() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (frame) {
      var overlay = frame.querySelector("[data-player-overlay]");
      var button = frame.querySelector("[data-play-button]");

      if (overlay) {
        overlay.addEventListener("click", function () {
          start(frame);
        });
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.stopPropagation();
          start(frame);
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
