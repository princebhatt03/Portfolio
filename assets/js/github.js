/**
 * Live GitHub repositories, pulled from the public API.
 *
 * The unauthenticated API allows 60 requests per hour per IP, so responses are
 * cached in localStorage for six hours — without that, a few refreshes during
 * development exhausts the visitor's quota for the whole site.
 *
 * The section renders nothing at all on failure rather than showing an error
 * box: this is a nice-to-have, and a broken widget looks worse than no widget.
 */
(function () {
  'use strict';

  const USERNAME = 'princebhatt03';
  const CACHE_KEY = 'gh-repos-v1';
  const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
  const SHOW = 6;

  const mount = document.getElementById('gh-repos');
  const section = document.getElementById('github');
  if (!mount || !section) return;

  // Language colours roughly matching GitHub's own
  const LANG_COLOR = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Java: '#b07219',
    Python: '#3572A5',
    EJS: '#a91e50',
    SCSS: '#c6538c',
    Shell: '#89e051',
  };

  const el = (tag, className, text) => {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  };

  const cache = {
    read() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { at, data } = JSON.parse(raw);
        if (Date.now() - at > CACHE_TTL) return null;
        return data;
      } catch (e) {
        return null;
      }
    },
    write(data) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
      } catch (e) {
        /* quota or private mode — just skip caching */
      }
    },
  };

  function card(repo) {
    const a = el('a', 'gh-card');
    a.href = repo.html_url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const head = el('div', 'gh-card-head');
    head.append(
      (() => {
        const i = el('i', 'bx bxl-github');
        i.setAttribute('aria-hidden', 'true');
        return i;
      })(),
      el('h4', 'gh-name', repo.name)
    );
    a.appendChild(head);

    a.appendChild(
      el('p', 'gh-desc', repo.description || 'No description provided.')
    );

    const meta = el('div', 'gh-meta');
    if (repo.language) {
      const lang = el('span', 'gh-lang');
      const dot = el('span', 'gh-dot');
      dot.style.background = LANG_COLOR[repo.language] || '#8a97a8';
      lang.append(dot, document.createTextNode(repo.language));
      meta.appendChild(lang);
    }
    if (repo.stargazers_count > 0) {
      meta.appendChild(el('span', 'gh-stat', `★ ${repo.stargazers_count}`));
    }
    meta.appendChild(
      el(
        'span',
        'gh-stat',
        'Updated ' +
          new Date(repo.pushed_at).toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric',
          })
      )
    );
    a.appendChild(meta);

    return a;
  }

  function render(repos) {
    const picked = repos
      .filter(r => !r.fork && !r.archived)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, SHOW);

    if (!picked.length) {
      section.remove();
      return;
    }

    const frag = document.createDocumentFragment();
    picked.forEach(r => frag.appendChild(card(r)));
    mount.textContent = '';
    mount.appendChild(frag);
    section.hidden = false;

    if (typeof AOS !== 'undefined') AOS.refresh();
  }

  const cached = cache.read();
  if (cached) {
    // Cached: reveal immediately, no skeleton flash.
    section.hidden = false;
    render(cached);
    return;
  }

  // Uncached: show the section with placeholders, so it doesn't pop in
  // halfway down the page once the request comes back.
  section.hidden = false;
  const clearSkeletons = window.Skeleton
    ? window.Skeleton.cards(mount, 'repo', SHOW)
    : function () {};

  fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(repos => {
      if (!Array.isArray(repos)) throw new Error('unexpected payload');
      // Store only the fields used, so the cache stays small
      const slim = repos.map(r => ({
        name: r.name,
        html_url: r.html_url,
        description: r.description,
        language: r.language,
        stargazers_count: r.stargazers_count,
        pushed_at: r.pushed_at,
        fork: r.fork,
        archived: r.archived,
      }));
      cache.write(slim);
      clearSkeletons();
      render(slim);
    })
    .catch(err => {
      // Rate limited or offline — leave the section hidden.
      console.warn('GitHub repos unavailable:', err.message);
      clearSkeletons();
      section.remove();
    });
})();
