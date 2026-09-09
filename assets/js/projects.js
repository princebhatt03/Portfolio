/**
 * Renders the case studies on portfolio-details.html from
 * assets/data/projects.json.
 *
 * Adding a project means adding one object to that file — the markup here
 * never needs to change. Everything is built with createElement and
 * textContent, so project copy can contain < and & without breaking, and a
 * typo in the JSON can never inject markup.
 */
(function () {
  'use strict';

  const mount = document.getElementById('case-studies');
  if (!mount) return;

  const status = document.getElementById('case-studies-status');

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  function buildLink(href, label, primary) {
    const a = el('a', primary ? 'cs-link cs-link-primary' : 'cs-link', label);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  function buildCard(p, index) {
    const article = el('article', 'cs-card');
    article.id = p.id;

    // --- media ---
    const figure = el('figure', 'cs-media');
    const img = el('img');
    img.src = p.image;
    img.alt = p.alt || `${p.name} screenshot`;
    img.width = 1360;
    img.height = 640;
    img.decoding = 'async';
    // The first card is above the fold on most screens
    if (index > 0) img.loading = 'lazy';
    figure.appendChild(img);
    article.appendChild(figure);

    // --- body ---
    const body = el('div', 'cs-body');

    const head = el('header', 'cs-head');
    const meta = el('p', 'cs-meta');
    meta.append(
      el('span', 'cs-category', p.category),
      el('span', 'cs-dot', '·'),
      el('span', null, p.year)
    );
    head.append(el('h3', 'cs-name', p.name), meta, el('p', 'cs-tagline', p.tagline));
    body.appendChild(head);

    // stack chips
    if (Array.isArray(p.stack) && p.stack.length) {
      const chips = el('ul', 'cs-stack');
      p.stack.forEach(t => chips.appendChild(el('li', null, t)));
      body.appendChild(chips);
    }

    const section = (label, node) => {
      const wrap = el('div', 'cs-section');
      wrap.append(el('h4', 'cs-label', label), node);
      return wrap;
    };

    if (p.problem) body.appendChild(section('The problem', el('p', null, p.problem)));

    if (Array.isArray(p.approach) && p.approach.length) {
      const ul = el('ul', 'cs-list');
      p.approach.forEach(a => ul.appendChild(el('li', null, a)));
      body.appendChild(section('Approach', ul));
    }

    if (p.learned) body.appendChild(section('What I took away', el('p', null, p.learned)));

    if (p.outcome) {
      const out = el('p', 'cs-outcome', p.outcome);
      body.appendChild(section('Outcome', out));
    }

    // --- links ---
    const links = el('div', 'cs-links');
    if (p.live) links.appendChild(buildLink(p.live, 'View live site', true));
    if (p.repo) links.appendChild(buildLink(p.repo, 'Source code', false));
    if (links.childNodes.length) body.appendChild(links);

    article.appendChild(body);
    return article;
  }

  // Placeholders in the real card shape, so the section has its final
  // height before the fetch resolves and nothing jumps when it does.
  const clearSkeletons = window.Skeleton
    ? window.Skeleton.cards(mount, 'caseStudy', 3)
    : function () {};

  fetch('assets/data/projects.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const projects = (data && data.projects) || [];
      if (!projects.length) throw new Error('no projects in file');

      const frag = document.createDocumentFragment();
      projects.forEach((p, i) => frag.appendChild(buildCard(p, i)));

      clearSkeletons();
      mount.appendChild(frag);

      if (typeof AOS !== 'undefined') AOS.refresh();
    })
    .catch(err => {
      console.error('Could not load case studies:', err);
      clearSkeletons();
      mount.appendChild(status || document.createElement('p'));
      if (!status) return;
      status.className = 'cs-status';
      status.textContent =
        'Case studies could not be loaded. All projects are listed on the home page and on GitHub.';
      status.classList.add('cs-status-error');
    });
})();
