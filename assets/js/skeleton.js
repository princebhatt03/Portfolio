/**
 * Skeleton loading.
 *
 * Replaces the old spinner overlay. Three levels, in order of appearance:
 *
 *   1. #page-skeleton — a full-page shell shaped like the real layout,
 *      already in the HTML so it paints with the first frame rather than
 *      waiting for this script. Removed once the page has loaded.
 *   2. Per-image skeletons — every <img> shimmers in its own reserved box
 *      until it decodes. Lazy images below the fold shimmer as you reach them.
 *   3. Async skeletons — projects.js and github.js call
 *      window.Skeleton.cards() to fill their sections before their fetch
 *      resolves.
 *
 * The shell is dismissed on window.load, but also on a hard timer: a
 * full-screen overlay that only a load event can remove will strand the
 * visitor on a blank page if any earlier script throws.
 */
(function () {
  'use strict';

  var MIN_VISIBLE = 350; // avoid a jarring flash on a warm cache
  var HARD_LIMIT = 6000; // absolute ceiling, whatever else happens
  var started = Date.now();

  /* ---------------------------------------------------------------- */
  /* 1. Page shell                                                     */
  /* ---------------------------------------------------------------- */

  var shell = document.getElementById('page-skeleton');
  var dismissed = false;

  function dismissShell() {
    if (dismissed || !shell) return;
    dismissed = true;

    var wait = Math.max(0, MIN_VISIBLE - (Date.now() - started));
    setTimeout(function () {
      shell.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
      // Remove from the DOM after the fade so it can't trap focus or clicks
      setTimeout(function () {
        if (shell && shell.parentNode) shell.parentNode.removeChild(shell);
      }, 500);
    }, wait);
  }

  if (shell) {
    document.body.classList.add('is-loading');
    window.addEventListener('load', dismissShell);
    // Failsafes — never let the shell outlive a broken script
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(dismissShell, 2500);
    });
    setTimeout(dismissShell, HARD_LIMIT);
  }

  /* ---------------------------------------------------------------- */
  /* 2. Per-image skeletons                                            */
  /* ---------------------------------------------------------------- */

  function watch(img) {
    if (img.dataset.skelWatched) return;
    img.dataset.skelWatched = '1';

    // Already in cache — nothing to shimmer
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('skel-done');
      return;
    }

    img.classList.add('skel-img');
    var clear = function () {
      img.classList.remove('skel-img');
      img.classList.add('skel-done');
    };
    img.addEventListener('load', clear, { once: true });
    // A broken image should not shimmer forever
    img.addEventListener('error', clear, { once: true });
  }

  function watchAll(root) {
    var imgs = (root || document).querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) watch(imgs[i]);
  }

  watchAll(document);

  // Case studies and GitHub cards are injected later
  if ('MutationObserver' in window) {
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.tagName === 'IMG') watch(n);
          else watchAll(n);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------------------------------------------------------------- */
  /* 3. Async placeholders                                             */
  /* ---------------------------------------------------------------- */

  function el(tag, className) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    return n;
  }

  function lines(parent, specs) {
    specs.forEach(function (cls) {
      parent.appendChild(el('div', 'skel skel-line ' + cls));
    });
  }

  function chips(parent, widths) {
    var wrap = el('div', 'skel-chips');
    widths.forEach(function (w) {
      var c = el('span', 'skel');
      c.style.width = w + 'px';
      wrap.appendChild(c);
    });
    parent.appendChild(wrap);
  }

  /** A case-study placeholder shaped like the real .cs-card */
  function caseStudyCard() {
    var card = el('div', 'skel-cs');
    card.appendChild(el('div', 'skel skel-cs-media'));

    var body = el('div', 'skel-cs-body');
    lines(body, ['lg w45']);
    lines(body, ['sm w30']);
    chips(body, [64, 52, 78, 46, 70]);
    lines(body, ['sm w30']);
    lines(body, ['', 'w90', 'w80']);
    var spacer = el('div');
    spacer.style.height = '14px';
    body.appendChild(spacer);
    lines(body, ['sm w30']);
    lines(body, ['', 'w90', 'w70']);

    card.appendChild(body);
    return card;
  }

  /** A repo placeholder shaped like the real .gh-card */
  function repoCard() {
    var card = el('div', 'skel-gh');
    lines(card, ['lg w60']);
    var gap = el('div');
    gap.style.height = '6px';
    card.appendChild(gap);
    lines(card, ['sm', 'sm w80']);
    var gap2 = el('div');
    gap2.style.height = '10px';
    card.appendChild(gap2);
    lines(card, ['sm w45']);
    return card;
  }

  var BUILDERS = { caseStudy: caseStudyCard, repo: repoCard };

  window.Skeleton = {
    /**
     * Fill a container with n placeholders of the given kind.
     * Returns a function that clears them.
     */
    cards: function (container, kind, n) {
      if (!container || !BUILDERS[kind]) return function () {};
      container.textContent = '';
      var frag = document.createDocumentFragment();
      for (var i = 0; i < n; i++) frag.appendChild(BUILDERS[kind]());
      container.appendChild(frag);
      container.setAttribute('aria-busy', 'true');
      return function () {
        container.textContent = '';
        container.removeAttribute('aria-busy');
      };
    },
  };
})();
