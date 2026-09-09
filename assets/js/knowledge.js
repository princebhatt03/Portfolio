/**
 * Local knowledge base for the AI assistant.
 *
 * Answers common questions about Prince straight from assets/data/profile.json
 * and assets/data/projects.json — no network call, no Gemini quota, correct
 * even when the backend is down or hasn't been redeployed. Anything it can't
 * confidently match falls through to the model, which has the same facts in
 * its system prompt.
 *
 * Matching is intent-scored rather than first-keyword-wins: every topic lists
 * the words that should pull towards it and, where needed, words that must be
 * present. The highest scorer above a threshold answers; a weak match answers
 * nothing and lets the model try.
 *
 * Exposes: window.PortfolioKnowledge.ready  -> Promise
 *          window.PortfolioKnowledge.answer -> (text) => string | null
 */
(function () {
  'use strict';

  let profile = null;
  let projects = [];

  /* ---------------------------------------------------------------- */
  /* Helpers                                                           */
  /* ---------------------------------------------------------------- */

  const norm = s =>
    String(s)
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9+#. ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  /** Whole-word-ish containment, so "java" doesn't match "javascript". */
  function has(text, term) {
    const t = term.toLowerCase();
    if (/[ .+#]/.test(t)) return text.indexOf(t) !== -1;
    return new RegExp('(^| )' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(s|es)?( |$)').test(text);
  }

  const list = arr => {
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
  };

  /** Whole years since the first professional role — never goes stale. */
  function yearsExperience() {
    const [y, m] = profile.careerStart.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const now = new Date();
    const months =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth());
    return Math.max(0, Math.floor(months / 12));
  }

  function experiencePhrase() {
    const y = yearsExperience();
    if (y < 1) {
      const [yy, mm] = profile.careerStart.split('-').map(Number);
      const now = new Date();
      const months = (now.getFullYear() - yy) * 12 + (now.getMonth() - (mm - 1));
      return months + ' months';
    }
    return y + '+ years';
  }

  const current = () => profile.experience.find(e => e.current) || profile.experience[0];

  const allSkills = () =>
    []
      .concat(profile.skills.production, profile.skills.comfortable, profile.skills.learning)
      .map(s => s.toLowerCase());

  /* ---------------------------------------------------------------- */
  /* Topics                                                            */
  /* ---------------------------------------------------------------- */

  function topics() {
    const c = profile.contact;

    return [
      {
        id: 'experience-years',
        need: ['experience', 'exp', 'experienced'],
        any: ['how many', 'how much', 'years', 'year', 'total', 'long', 'yrs'],
        answer() {
          const cur = current();
          return `Prince has ${experiencePhrase()} of professional experience. He started in March 2024 and is currently a ${cur.title} at ${cur.company}.`;
        },
      },
      {
        id: 'experience-detail',
        need: ['work history', 'employment history', 'career history', 'history', 'experience', 'worked', 'work', 'career', 'background', 'companies', 'company', 'employment', 'job', 'jobs'],
        answer() {
          const roles = profile.experience
            .map(e => `${e.title} at ${e.company} (${e.start} – ${e.end})`)
            .join('; ');
          return `${experiencePhrase()} across four roles — ${roles}.`;
        },
      },
      {
        id: 'current-role',
        need: ['current', 'currently', 'now', 'present', 'today', 'working', 'works', 'where'],
        any: ['work', 'working', 'role', 'job', 'company', 'employed', 'doing'],
        answer() {
          const cur = current();
          return `He is currently a ${cur.title} at ${cur.company}, since ${cur.start}. ${cur.points[0]}`;
        },
      },
      {
        id: 'skills',
        need: ['skill', 'skills', 'stack', 'tech', 'technologies', 'technology', 'know', 'languages', 'language', 'expertise', 'good at', 'proficient'],
        answer() {
          return `In production: ${list(profile.skills.production)}. Also comfortable with ${list(profile.skills.comfortable.slice(0, 8))}. Currently learning ${list(profile.skills.learning)}.`;
        },
      },
      {
        id: 'education',
        need: ['education', 'degree', 'college', 'university', 'study', 'studied', 'graduate', 'graduation', 'btech', 'b.tech', 'qualification', 'school', 'academic'],
        answer() {
          const e = profile.education;
          return `${e.degree}, from ${e.institute} (${e.start} – ${e.end}).`;
        },
      },
      {
        id: 'contact',
        need: ['contact', 'email', 'reach', 'hire', 'touch', 'mail', 'connect', 'talk', 'message'],
        answer() {
          return `Email him at ${c.email}, or use the contact form on this page. He's also on LinkedIn and GitHub.`;
        },
      },
      {
        id: 'github',
        need: ['github', 'repo', 'repos', 'repositories', 'source code', 'code'],
        answer() {
          return `His GitHub is ${c.githubHandle} — ${c.github}. The latest repositories are listed further down this page.`;
        },
      },
      {
        id: 'linkedin',
        need: ['linkedin', 'linked in'],
        answer() {
          return `LinkedIn: ${c.linkedin}`;
        },
      },
      {
        id: 'location',
        need: ['location', 'where', 'based', 'city', 'live', 'lives', 'from', 'country', 'located'],
        any: ['live', 'based', 'located', 'from', 'city', 'location', 'country', 'where'],
        answer() {
          const l = profile.location;
          return `Prince is based in ${l.city}, ${l.region}, ${l.country}.`;
        },
      },
      {
        id: 'availability',
        need: ['available', 'availability', 'freelance', 'hiring', 'hire', 'open to', 'opportunity', 'opportunities', 'looking for', 'free'],
        answer() {
          return `${profile.availability.summary} The quickest way to start is the contact form on this page, or email ${c.email}.`;
        },
      },
      {
        id: 'resume',
        need: ['resume', 'cv', 'curriculum'],
        answer() {
          return `His resume is on this page — the Resume section has a viewer and a PDF download.`;
        },
      },
      {
        id: 'age',
        need: ['age', 'old', 'birthday', 'born', 'dob', 'birth'],
        answer() {
          const d = new Date(profile.dob);
          const n = new Date();
          let a = n.getFullYear() - d.getFullYear();
          if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
          return `He is ${a}, born 3 August 2002.`;
        },
      },
      {
        id: 'strengths',
        need: ['strength', 'strengths', 'best at', 'specialise', 'specialize', 'specialty', 'strong', 'focus'],
        answer() {
          return profile.strengths.join(' ');
        },
      },
      {
        id: 'projects-list',
        need: ['project', 'projects', 'built', 'build', 'made', 'work on', 'portfolio'],
        answer() {
          const names = projects.map(p => p.name);
          return `Main projects: ${list(names)}. Full case studies — the problem, the stack and what he took away — are on the Projects page.`;
        },
      },
      {
        id: 'about',
        need: ['who is prince', 'about prince', 'tell me about', 'who is he', 'introduce'],
        answer() {
          const cur = current();
          return `Prince Bhatt is a ${profile.role} based in ${profile.location.city}, with ${experiencePhrase()} of experience. He holds a ${profile.education.degree.split(',')[0]} from ${profile.education.institute.split('(')[0].trim()}, and is currently a ${cur.title} at ${cur.company}.`;
        },
      },
      {
        id: 'greeting',
        need: ['hi', 'hello', 'hey', 'yo', 'good morning', 'good evening', 'namaste'],
        answer() {
          return `Hello. Ask me about Prince's experience, stack, projects, or how to get in touch.`;
        },
        // Only for a bare greeting — "hey what's his stack" should route to the
        // stack topic, not here.
        guard: q => q.split(' ').length <= 3,
      },
      {
        id: 'assistant',
        need: ['who are you', 'what are you', 'are you prince', 'are you a bot', 'are you human', 'are you ai'],
        answer() {
          return `I'm the assistant on Prince's portfolio. Ask me about his experience, stack, projects or how to reach him.`;
        },
      },
    ];
  }

  /* ---------------------------------------------------------------- */
  /* Matching                                                          */
  /* ---------------------------------------------------------------- */

  function matchProject(q) {
    for (const p of projects) {
      const name = norm(p.name);
      const alias = name.replace(/\s+/g, '');
      if (q.indexOf(name) !== -1 || q.replace(/\s+/g, '').indexOf(alias) !== -1) {
        const bits = [`${p.name} — ${p.tagline}.`];
        if (p.stack && p.stack.length) bits.push(`Built with ${list(p.stack)}.`);
        if (p.problem) bits.push(p.problem);
        if (p.live) bits.push(`Live at ${p.live}`);
        return bits.join(' ');
      }
    }
    return null;
  }

  /** "Does he know Docker?" — answer from whichever tier the skill sits in. */
  function matchSkillQuery(q) {
    const asking = /\b(know|knows|used|use|uses|worked with|familiar|experience with|good at|can he|does he|do you know|is he good)\b/.test(q);
    if (!asking) return null;
    const tiers = [
      ['production', s => `uses ${s} in production`],
      ['comfortable', s => `is comfortable with ${s}`],
      ['learning', s => `is currently learning ${s}`],
    ];
    for (const [tier, phrase] of tiers) {
      for (const s of profile.skills[tier]) {
        if (has(q, norm(s))) {
          return `Yes — Prince ${phrase(s)}.`;
        }
      }
    }
    // Asked about something not on the list at all
    const known = allSkills();
    const mentioned = q.split(' ').filter(w => w.length > 2 && known.indexOf(w) === -1);
    if (mentioned.length && /\b(know|knows|use|uses|familiar|experience with)\b/.test(q)) return null;
    return null;
  }

  function matchNotKnown(q) {
    for (const t of profile.notKnown.topics) {
      if (q.indexOf(t) !== -1) return profile.notKnown.message;
    }
    return null;
  }

  function answer(raw) {
    if (!profile) return null;
    const q = norm(raw);
    if (!q) return null;

    // Things deliberately not on file beat everything else
    const nk = matchNotKnown(q);
    if (nk) return nk;

    const proj = matchProject(q);
    if (proj) return proj;

    const skill = matchSkillQuery(q);
    if (skill) return skill;

    let best = null;
    let bestScore = 0;

    for (const t of topics()) {
      let score = 0;
      let needHit = false;
      for (const n of t.need) {
        if (has(q, n)) {
          needHit = true;
          score += n.indexOf(' ') !== -1 ? 3 : 2; // phrases are stronger signals
        }
      }
      if (!needHit) continue;
      if (t.guard && !t.guard(q)) continue;
      if (t.any) {
        for (const a of t.any) if (has(q, a)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        best = t;
      }
    }

    // A single weak keyword isn't enough to claim the question
    return best && bestScore >= 2 ? best.answer() : null;
  }

  /* ---------------------------------------------------------------- */
  /* Load                                                              */
  /* ---------------------------------------------------------------- */

  const grab = url =>
    fetch(url).then(r => {
      if (!r.ok) throw new Error(url + ' -> ' + r.status);
      return r.json();
    });

  const ready = Promise.all([
    grab('assets/data/profile.json'),
    grab('assets/data/projects.json').catch(() => ({ projects: [] })),
  ])
    .then(([prof, proj]) => {
      profile = prof;
      projects = (proj && proj.projects) || [];
      return true;
    })
    .catch(err => {
      // Not fatal: the assistant simply falls back to the model for everything.
      console.warn('Knowledge base unavailable:', err.message);
      return false;
    });

  window.PortfolioKnowledge = { ready, answer, get profile() { return profile; } };
})();
