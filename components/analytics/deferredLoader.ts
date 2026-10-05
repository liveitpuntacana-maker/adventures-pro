/**
 * Inline helper that postpones loading third-party tracking scripts.
 *
 * The Meta Pixel and Google Analytics scripts cost about 1.7 seconds of main-thread
 * time on a mid-range phone, which is most of what held the mobile speed score
 * down. Both are loaded here on the visitor's first scroll, tap or key press, or
 * after four seconds, whichever comes first.
 *
 * Nothing is lost while they wait: each tool's small stub (`fbq`, `gtag`) is
 * defined straight away and queues its calls, and the server-side Conversions API
 * call that accompanies every Meta event does not depend on the browser script.
 * The one trade-off is a visitor who leaves within the first few seconds without
 * touching the page: the browser-side hit is not sent for them.
 *
 * Idempotent: both tracking components include it and only the first one defines it.
 */
export const DEFER_LOADER_SNIPPET = `
  (function () {
    if (window.__afDefer) return;
    var queue = [];
    var fired = false;
    function run() {
      if (fired) return;
      fired = true;
      var pending = queue;
      queue = [];
      for (var i = 0; i < pending.length; i++) {
        try { pending[i](); } catch (e) {}
      }
    }
    ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach(function (name) {
      window.addEventListener(name, run, { once: true, passive: true });
    });
    setTimeout(run, 4000);
    window.__afDefer = function (fn) { if (fired) fn(); else queue.push(fn); };
  })();
`;
