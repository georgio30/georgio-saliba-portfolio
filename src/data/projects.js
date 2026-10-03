/*
  Every project on the page comes from this list, in this order.

  To add a project, copy an entry and fill it in:
    - title, year, type, summary, description, technologies
    - screenshots: put the original PNG/JPG files in images-src/projects/,
      run `npm run images`, then list each one by file name (no extension),
      e.g. { name: 'my-project-home', alt: 'Home page with ...' }.
      The first screenshot is used on the card. Leave the list empty and the
      card shows a cover made from the project's own details instead.
    - github / live: the project's own repository and site. Leave them as
      null when they don't exist; no button is shown then.
    - layers (optional): how the app is put together, shown in the gallery
      when there are no screenshots.
    - phone: true on one screenshot makes the card use it on phones
      (the card is portrait there, so a phone screenshot fits best).
    - note (optional): a small personal label next to the title.
    - tone: background colour of the generated cover.
*/
export const projects = [
  {
    slug: 'saliba-polyclinic',
    title: 'Saliba Polyclinic',
    year: '2026',
    type: 'Full-stack web app',
    summary: 'Patients, doctors and appointments, behind secure, role-based logins.',
    description:
      'A Polyclinic Management System with JWT authentication and role-based access control (RBAC) for managing patients, doctors and appointments.',
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'JWT'],
    layers: [
      { name: 'Interface', items: ['React', 'TypeScript'] },
      { name: 'API', items: ['Node.js', 'Express', 'JWT auth', 'Role-based access'] },
      { name: 'Data', items: ['MySQL'] },
    ],
    screenshots: [],
    github: null,
    live: null,
    note: 'Most recent build',
    tone: '#ebe7dc',
  },
  {
    slug: 'iverse',
    title: 'Iverse',
    year: '2025',
    type: 'E-commerce web app',
    summary: 'An online store, from browsing to cart to checkout.',
    description:
      'An online store with user authentication, product browsing, cart and checkout-style shopping features, styled with Tailwind CSS.',
    technologies: ['React', 'Tailwind CSS', 'Node.js', 'Express', 'MySQL'],
    layers: [
      { name: 'Interface', items: ['React', 'Tailwind CSS'] },
      { name: 'API', items: ['Node.js', 'Express', 'User auth'] },
      { name: 'Data', items: ['MySQL'] },
    ],
    screenshots: [],
    github: null,
    live: null,
    tone: '#f1e2d9',
  },
  {
    slug: 'recipe-finder',
    title: 'Recipe Finder',
    year: '2025',
    type: 'Cross-platform mobile app',
    summary: 'Recipe discovery for iOS and Android.',
    description:
      'A recipe discovery app for iOS and Android with Firebase authentication and Spoonacular API integration.',
    technologies: ['React Native', 'Firebase', 'Spoonacular API'],
    layers: [
      { name: 'App', items: ['React Native', 'iOS', 'Android'] },
      { name: 'Services', items: ['Firebase auth', 'Spoonacular API'] },
    ],
    screenshots: [],
    github: null,
    live: null,
    note: 'The mobile one',
    tone: '#e4e6dc',
  },
  {
    slug: 'portfolio',
    title: 'This portfolio',
    year: '2026',
    type: 'Personal site',
    summary: 'The page you are on: a scroll-through gallery built without animation libraries.',
    description:
      'A one-page portfolio built with React, Vite and Tailwind CSS. The 3D project gallery runs on CSS transforms driven by scroll position, with a lighter version for phones and a static one for reduced motion.',
    technologies: ['React', 'Vite', 'Tailwind CSS', 'CSS 3D transforms'],
    screenshots: [
      { name: 'portfolio-hero', alt: 'Portfolio hero with the headline "I build web apps from the database up."' },
      { name: 'portfolio-work', alt: 'The 3D project gallery mid-scroll, one project in front and the next approaching' },
      { name: 'portfolio-mobile', alt: 'The portfolio on a phone-sized screen', phone: true },
    ],
    github: 'https://github.com/georgio30/georgio-saliba-portfolio',
    live: 'https://georgio-saliba-portfolio.vercel.app',
    tone: '#efede7',
  },
]
