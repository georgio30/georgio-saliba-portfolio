# Georgio Saliba — Portfolio

A one-page portfolio for **Georgio Saliba**, Full-Stack Developer (React · TypeScript · Node.js · Express · MySQL).

Scroll past the hero and the projects move through a quiet 3D space: the one in front recedes to the side as the next one comes forward. Click a project and it opens in a lightbox with its own gallery, links and source.

**🔗 Live demo: [georgio-saliba-portfolio.vercel.app](https://georgio-saliba-portfolio.vercel.app/)**

![Portfolio preview — light mode](docs/preview-light.png)

<details>
<summary>Dark mode</summary>

![Portfolio preview — dark mode](docs/preview-dark.png)

</details>

## Features

- **3D scroll gallery:** projects are placed with CSS 3D transforms driven by scroll position (no animation or 3D library). Phones get a flatter, shallower version; *prefers-reduced-motion* gets a plain list
- **Project lightbox:** multiple screenshots with arrows, dots, swipe and keyboard; Escape to close; the page behind is locked, keeps its scroll position and gets focus back when you close it
- **Per-project links:** "Live website" and "View source on GitHub" point to that project's own site and repository, and are only shown when they exist
- **English, French and Arabic:** a language switcher in the navbar, remembered per visitor (first visits follow the browser language). Arabic is fully right to left: mirrored layout and arrows, direction-aware gallery swipes and arrow keys, and Arabic fonts (IBM Plex Sans Arabic, Amiri). Built in, with no i18n library
- **Light / dark mode:** light by default (dark if the system prefers it), remembers the visitor's choice, no flash on load
- **Responsive images:** screenshots are served as WebP at 800 and 1600 px and lazy-loaded; a project can mark one screenshot as its phone version for the portrait card on small screens
- **Sharing and search:** link preview image and tags, structured data about Georgio, a custom 404 page and a skip-to-content link

## Adding a project

1. Put the original screenshots (PNG or JPG) in `images-src/projects/`, e.g. `my-app-home.png`.
2. Run `npm run images`. It writes `my-app-home-800.webp` and `my-app-home-1600.webp` to `public/images/projects/`.
3. Add an entry to [`src/data/projects.js`](src/data/projects.js):

```js
{
  slug: 'my-app',
  title: 'My App',
  year: '2026',
  type: 'Web app',
  summary: 'One line for the card.',
  description: 'A few sentences for the lightbox.',
  technologies: ['React', 'TypeScript'],
  screenshots: [
    { name: 'my-app-home', alt: 'Home page showing ...' },
    { name: 'my-app-phone', alt: 'The app on a phone', phone: true }, // optional
  ],
  github: 'https://github.com/georgio30/my-app', // or null
  live: 'https://my-app.example.com',          // or null
  tone: '#ece8df',
}
```

A project with no screenshots gets a generated cover (and a "how it's put together" panel if it has `layers`).

To translate a field, give it one value per language instead of a string. Anything left as a plain string is shown as-is in every language, and a missing language falls back to English:

```js
summary: {
  en: 'One line for the card.',
  fr: 'Une ligne pour la carte.',
  ar: 'سطر واحد للبطاقة.',
},
```

## Translations

- Interface text (nav, buttons, headings, labels) lives in [`src/i18n/en.js`](src/i18n/en.js), [`fr.js`](src/i18n/fr.js) and [`ar.js`](src/i18n/ar.js). Each file has the same keys.
- Project and CV text is translated next to the data, in [`src/data/projects.js`](src/data/projects.js) and [`src/data/resume.js`](src/data/resume.js), using the `{ en, fr, ar }` form above.
- Components read both through the `useI18n()` hook: `t` for interface text, `pick(field)` for data fields.
- For right-to-left support, use logical Tailwind classes (`ms-`, `ps-`, `start-`, `text-start`) instead of left/right ones, and `rtl:` variants where something must flip (for example `rtl:-scale-x-100` on an arrow).

## Tech stack

| | |
|---|---|
| Framework | [React 19](https://react.dev) + [Vite](https://vite.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Images | [sharp](https://sharp.pixelplumbing.com) (dev only, for `npm run images`) |
| Linting | [oxlint](https://oxc.rs) |

## Getting started

Requires [Node.js](https://nodejs.org) 20 or newer.

```bash
git clone https://github.com/georgio30/georgio-saliba-portfolio.git
cd georgio-saliba-portfolio
npm install
npm run dev
```

Then open http://localhost:5173.

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the code |
| `npm run images` | Turn screenshots in `images-src/projects/` into responsive WebP |

## Project structure

```
src/
├── App.jsx                 # Page layout
├── index.css               # Tailwind theme tokens (light & dark)
├── data/
│   ├── projects.js         # Every project shown in the gallery
│   └── resume.js           # Profile, experience, skills
├── i18n/
│   ├── index.jsx           # Language provider and useI18n() hook
│   └── en.js, fr.js, ar.js # Interface text per language
├── lib/                    # Shared hooks and gallery helper
└── components/
    ├── Navbar.jsx          # Sticky nav, active section, scroll progress
    ├── Hero.jsx
    ├── Experience.jsx      # The internships, told briefly
    ├── ProjectShowcase.jsx # The 3D scroll gallery
    ├── ProjectCard.jsx     # One project in the gallery (hover depth)
    ├── ProjectCover.jsx    # Generated cover for projects without screenshots
    ├── ProjectModal.jsx    # Lightbox
    ├── ProjectGallery.jsx  # Screenshots inside the lightbox (swipe, dots, arrows)
    ├── About.jsx
    ├── Contact.jsx
    ├── Footer.jsx
    ├── LanguageSwitcher.jsx # EN · FR · ع in the navbar
    └── ...                 # Section, Reveal, Screenshot, ThemeToggle, Icons
scripts/optimize-images.mjs
images-src/projects/        # Original screenshots
```

## Contact

- GitHub: [@georgio30](https://github.com/georgio30)
- LinkedIn: [Georgio Saliba](https://lb.linkedin.com/in/georgio-saliba-30265a2b4)
- Email: [georgiosaliba@hotmail.com](mailto:georgiosaliba@hotmail.com)
