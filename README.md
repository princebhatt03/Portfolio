<h1 align="center">Prince Bhatt — Portfolio</h1>

<p align="center">
  Full Stack Developer · Bhopal, India<br>
  <a href="https://princebhatt03.github.io/Portfolio/">princebhatt03.github.io/Portfolio</a>
</p>

<p align="center">
  <a href="mailto:princebhatt316@gmail.com"><img src="https://img.shields.io/badge/Email-princebhatt316@gmail.com-red?style=flat&logo=gmail" alt="Email"></a>
  <a href="https://github.com/princebhatt03"><img src="https://img.shields.io/badge/GitHub-princebhatt03-181717?style=flat&logo=github" alt="GitHub"></a>
  <a href="https://www.linkedin.com/in/prince-bhatt-0958a725a/"><img src="https://img.shields.io/badge/LinkedIn-Prince%20Bhatt-blue?style=flat&logo=linkedin" alt="LinkedIn"></a>
</p>

---

## What this is

My personal portfolio: a static site, plus a small Node service that powers the
AI assistant in the corner of the page.

**Front end** — hand-written HTML, CSS and vanilla JavaScript on Bootstrap 5.
No build step: the files in this repo are the files that get served.

**Back end** (`Server/`) — Express endpoint that proxies Google's Gemini API and
streams replies back over Server-Sent Events.

## Stack

| Layer | Used |
|---|---|
| Markup & styling | HTML5, CSS3 (custom properties for theming), Bootstrap 5 |
| Scripting | Vanilla JavaScript (ES2020), no framework |
| Libraries | AOS, Swiper, Isotope, GLightbox, Typed.js, PureCounter, Waypoints |
| Chat backend | Node.js, Express 5, `@google/generative-ai` (Gemini 2.5 Flash) |
| Email | EmailJS (client-side), SweetAlert2 for feedback |
| Hosting | GitHub Pages (site) · Vercel (chat API) |

## Structure

```
.
├── index.html                  Home — all sections
├── portfolio-details.html      Case studies, rendered from JSON
├── 404.html                    Custom not-found page
├── robots.txt  sitemap.xml
├── cleanup.ps1                 One-off script removing replaced/unused assets
├── assets/
│   ├── css/style.css           Tokens, light + dark themes, all components
│   ├── data/projects.json      Source of truth for the case studies
│   ├── img/                    WebP images (originals are not committed)
│   ├── js/
│   │   ├── main.js             Nav, theme toggle, AOS, sliders, resume viewer
│   │   ├── chat.js             AI assistant — SSE streaming client
│   │   ├── projects.js         Renders case studies from projects.json
│   │   ├── github.js           Live repo list from the GitHub API
│   │   └── email.js            Contact form (EmailJS + spam guards)
│   └── vendor/                 Third-party libraries
└── Server/
    ├── index.js                Express + Gemini SSE endpoint
    ├── .env.example            Required environment variables
    └── package.json
```

## Running it locally

**Front end** — any static server; opening `index.html` directly breaks the
`fetch` in `projects.js` because of `file://` CORS.

```bash
npx serve .
# or
python3 -m http.server 3000
```

**Chat backend**

```bash
cd Server
cp .env.example .env      # then add your GEMINI_API_KEY
npm install
npm start                 # http://localhost:5000
```

Get a Gemini key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | yes | Google AI Studio key. The server exits at startup without it. |
| `ALLOWED_ORIGINS` | no | Comma-separated CORS allowlist. Defaults to the GitHub Pages URL plus localhost. **Set this in production** — anything not listed gets a 403. |
| `PORT` | no | Local port, default 5000. Ignored on Vercel. |

The endpoint is rate limited to 10 requests per minute per IP, caps request
bodies at 4 KB, and rejects messages over 500 characters — without those, an open
`/api/chat` is a free Gemini proxy billed to your key.

## Adding a project

Add an object to `assets/data/projects.json`. `portfolio-details.html` renders
whatever is in that file, so nothing else needs editing:

```jsonc
{
  "id": "slug",
  "name": "Project name",
  "tagline": "One line on what it does",
  "category": "Full Stack",
  "year": "2026",
  "image": "assets/img/portfolio/name.webp",
  "thumb": "assets/img/portfolio/name-thumb.webp",
  "alt": "Describe the screenshot",
  "live": "https://…",
  "repo": "https://github.com/…",   // null if private
  "problem": "What it was actually trying to solve",
  "approach": ["Decision one", "Decision two"],
  "stack": ["Node.js", "React"],
  "learned": "What you took away",
  "outcome": null                    // leave null rather than inventing a number
}
```

To show it on the home page too, add a card to the grid in `index.html` with a
`filter-fullstack`, `filter-frontend` or `filter-freelance` class.

## Images

Everything is WebP, generated at the size it renders (thumbnails at 760px, full
size at 1360px for the lightbox). Originals are not committed — they were ~9.9 MB
of PNG screenshots for a page that now ships around 360 KB of images.

Before adding a new screenshot, convert and resize it:

```bash
cwebp -q 78 -resize 1360 0 shot.png -o assets/img/portfolio/name.webp
cwebp -q 76 -resize 760 0 shot.png -o assets/img/portfolio/name-thumb.webp
```

Give every `<img>` a real `alt`, explicit `width`/`height`, and
`loading="lazy"` if it's below the fold.

## Theming

Colours live as custom properties at the top of `style.css`. Dark mode is
defined twice on purpose — once under `prefers-color-scheme` for viewers on the
OS default, once under `[data-theme="dark"]` for an explicit toggle choice. A
small script in `<head>` applies a saved choice before first paint so there's no
white flash.

Changing a colour means editing one token, not hunting through the file.

## Deploying

**Site** — push to `main`; GitHub Pages serves from the repo root.

**Chat API** — deploy `Server/` to Vercel. `index.js` exports the app and only
calls `listen()` outside a serverless environment, so the same file works on
Render or locally. Set `GEMINI_API_KEY` and `ALLOWED_ORIGINS` in the project's
environment settings.

If you move the site off GitHub Pages, update `ALLOWED_ORIGINS`, the `canonical`
link, the Open Graph URLs, and `sitemap.xml`.

## Still open

- [ ] Blog posts as Markdown instead of linked PDFs and Drive folders
- [ ] Analytics, to see which projects people actually open
- [ ] Contact form through the backend with Turnstile, replacing client-side EmailJS
- [ ] Lighthouse + HTML validation in CI
- [ ] Possible rebuild on Astro or Next.js

---

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=princebhatt03&show_icons=true&theme=radical" alt="GitHub stats" />
</p>
