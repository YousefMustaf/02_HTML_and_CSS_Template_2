// Animate the skill bars every time the Skills section scrolls into view.
// The target % is read from each bar's data-progress attribute, so the
// HTML stays the single source of truth (and bars still show their final
// width if JavaScript is disabled).
(function () {
  var holder = document.querySelector(".ourSkills .skills");
  var bars = document.querySelectorAll(".ourSkills .skills .prog span");
  if (!holder || !bars.length) return;

  var DURATION = 1500; // ms
  var STAGGER = 150; // ms between bars
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function setValue(bar, value) {
    bar.style.width = value + "%";
    bar.setAttribute("data-progress", value + "%");
  }

  // Remember each bar's final value
  bars.forEach(function (bar) {
    bar.dataset.target = parseFloat(bar.getAttribute("data-progress"));
    bar._timer = null;
    bar._raf = null;
  });

  function cancel(bar) {
    clearTimeout(bar._timer);
    cancelAnimationFrame(bar._raf);
  }

  function reset() {
    bars.forEach(function (bar) {
      cancel(bar);
      setValue(bar, 0);
    });
  }

  function play() {
    bars.forEach(function (bar, i) {
      cancel(bar);
      var target = parseFloat(bar.dataset.target);
      if (reduceMotion) return setValue(bar, target);
      bar._timer = setTimeout(function () {
        var start = null;
        function step(now) {
          if (start === null) start = now;
          var t = Math.min((now - start) / DURATION, 1);
          setValue(bar, Math.round(target * easeOutCubic(t)));
          if (t < 1) bar._raf = requestAnimationFrame(step);
        }
        bar._raf = requestAnimationFrame(step);
      }, i * STAGGER);
    });
  }

  reset();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        // Replay on every entry, reset on every exit
        if (entries[entries.length - 1].isIntersecting) play();
        else reset();
      },
      { threshold: 0.1 }
    ).observe(holder);
  } else {
    play();
  }
})();
