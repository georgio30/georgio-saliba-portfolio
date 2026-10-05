/*
  Every project on the page comes from this list, in this order.

  To add a project, copy an entry and fill it in:
    - title, year, type, summary, description, technologies
    - text can be one value for every language, or { en, fr, ar } to
      translate it (see src/i18n); missing languages fall back to en.
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

// Layer names and items shared by several projects
const layer = {
  interface: { en: 'Interface', fr: 'Interface', ar: 'الواجهة' },
  api: { en: 'API', fr: 'API', ar: 'API' },
  data: { en: 'Data', fr: 'Données', ar: 'البيانات' },
}

export const projects = [
  {
    slug: 'saliba-polyclinic',
    title: 'Saliba Polyclinic',
    year: '2026',
    type: { en: 'Full-stack web app', fr: 'Application web full-stack', ar: 'تطبيق ويب متكامل' },
    summary: {
      en: 'Patients, doctors and appointments, behind secure, role-based logins.',
      fr: 'Patients, médecins et rendez-vous, derrière des connexions sécurisées par rôle.',
      ar: 'المرضى والأطباء والمواعيد، خلف تسجيل دخول آمن حسب الدور.',
    },
    description: {
      en: 'A Polyclinic Management System with JWT authentication and role-based access control (RBAC) for managing patients, doctors and appointments.',
      fr: 'Un système de gestion de polyclinique avec authentification JWT et contrôle d’accès par rôle (RBAC) pour gérer patients, médecins et rendez-vous.',
      ar: 'نظام لإدارة عيادة متعددة الاختصاصات مع مصادقة JWT وتحكّم بالوصول حسب الدور (RBAC) لإدارة المرضى والأطباء والمواعيد.',
    },
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'JWT'],
    layers: [
      { name: layer.interface, items: ['React', 'TypeScript'] },
      {
        name: layer.api,
        items: [
          'Node.js',
          'Express',
          { en: 'JWT auth', fr: 'Auth JWT', ar: 'مصادقة JWT' },
          { en: 'Role-based access', fr: 'Accès par rôle', ar: 'صلاحيات حسب الدور' },
        ],
      },
      { name: layer.data, items: ['MySQL'] },
    ],
    screenshots: [],
    github: null,
    live: null,
    note: { en: 'Most recent build', fr: 'Le plus récent', ar: 'الأحدث' },
    tone: '#ebe7dc',
  },
  {
    slug: 'iverse',
    title: 'Iverse',
    year: '2025',
    type: { en: 'E-commerce web app', fr: 'Application e-commerce', ar: 'تطبيق تجارة إلكترونية' },
    summary: {
      en: 'An online store, from browsing to cart to checkout.',
      fr: 'Une boutique en ligne, de la navigation au panier jusqu’au paiement.',
      ar: 'متجر إلكتروني، من التصفّح إلى السلة حتى الدفع.',
    },
    description: {
      en: 'An online store with user authentication, product browsing, cart and checkout-style shopping features, styled with Tailwind CSS.',
      fr: 'Une boutique en ligne avec authentification des utilisateurs, catalogue de produits, panier et parcours d’achat, stylisée avec Tailwind CSS.',
      ar: 'متجر إلكتروني مع مصادقة المستخدمين وتصفّح المنتجات وسلة مشتريات ومسار شراء متكامل، مصمَّم باستخدام Tailwind CSS.',
    },
    technologies: ['React', 'Tailwind CSS', 'Node.js', 'Express', 'MySQL'],
    layers: [
      { name: layer.interface, items: ['React', 'Tailwind CSS'] },
      {
        name: layer.api,
        items: ['Node.js', 'Express', { en: 'User auth', fr: 'Auth utilisateur', ar: 'مصادقة المستخدمين' }],
      },
      { name: layer.data, items: ['MySQL'] },
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
    type: {
      en: 'Cross-platform mobile app',
      fr: 'Application mobile multiplateforme',
      ar: 'تطبيق جوّال متعدد المنصّات',
    },
    summary: {
      en: 'Recipe discovery for iOS and Android.',
      fr: 'La découverte de recettes, sur iOS et Android.',
      ar: 'اكتشاف الوصفات على iOS وAndroid.',
    },
    description: {
      en: 'A recipe discovery app for iOS and Android with Firebase authentication and Spoonacular API integration.',
      fr: 'Une application de découverte de recettes pour iOS et Android, avec authentification Firebase et intégration de l’API Spoonacular.',
      ar: 'تطبيق لاكتشاف الوصفات على iOS وAndroid مع مصادقة Firebase وتكامل مع واجهة Spoonacular البرمجية.',
    },
    technologies: ['React Native', 'Firebase', 'Spoonacular API'],
    layers: [
      { name: { en: 'App', fr: 'Appli', ar: 'التطبيق' }, items: ['React Native', 'iOS', 'Android'] },
      {
        name: { en: 'Services', fr: 'Services', ar: 'الخدمات' },
        items: [{ en: 'Firebase auth', fr: 'Auth Firebase', ar: 'مصادقة Firebase' }, 'Spoonacular API'],
      },
    ],
    screenshots: [],
    github: null,
    live: null,
    note: { en: 'The mobile one', fr: 'La version mobile', ar: 'تطبيق الجوّال' },
    tone: '#e4e6dc',
  },
  {
    slug: 'portfolio',
    title: { en: 'This portfolio', fr: 'Ce portfolio', ar: 'هذا الموقع' },
    year: '2026',
    type: { en: 'Personal site', fr: 'Site personnel', ar: 'موقع شخصي' },
    summary: {
      en: 'The page you are on: a scroll-through gallery built without animation libraries.',
      fr: 'La page que vous lisez\u00a0: une galerie à faire défiler, sans bibliothèque d’animation.',
      ar: 'الصفحة التي تتصفّحها الآن: معرض يتحرّك مع التمرير من دون مكتبات رسوم متحركة.',
    },
    description: {
      en: 'A one-page portfolio built with React, Vite and Tailwind CSS. The 3D project gallery runs on CSS transforms driven by scroll position, with a lighter version for phones and a static one for reduced motion.',
      fr: 'Un portfolio d’une seule page construit avec React, Vite et Tailwind CSS. La galerie 3D repose sur des transformations CSS pilotées par le défilement, avec une version allégée pour les téléphones et une version statique quand les animations sont réduites.',
      ar: 'موقع شخصي من صفحة واحدة مبني بـ React وVite وTailwind CSS. يعتمد معرض المشاريع ثلاثي الأبعاد على تحويلات CSS يقودها موضع التمرير، مع نسخة أخفّ للهواتف ونسخة ثابتة لمن يفضّلون تقليل الحركة.',
    },
    technologies: ['React', 'Vite', 'Tailwind CSS', 'CSS 3D transforms'],
    screenshots: [
      {
        name: 'portfolio-hero',
        alt: {
          en: 'Portfolio hero with the headline "I build web apps from the database up."',
          fr: 'L’en-tête du portfolio avec le titre «\u00a0I build web apps from the database up.\u00a0»',
          ar: 'الواجهة الرئيسية للموقع مع العنوان "I build web apps from the database up."',
        },
      },
      {
        name: 'portfolio-work',
        alt: {
          en: 'The 3D project gallery mid-scroll, one project in front and the next approaching',
          fr: 'La galerie 3D en plein défilement, un projet au premier plan et le suivant qui approche',
          ar: 'معرض المشاريع ثلاثي الأبعاد أثناء التمرير، مشروع في المقدّمة والتالي يقترب',
        },
      },
      {
        name: 'portfolio-mobile',
        alt: {
          en: 'The portfolio on a phone-sized screen',
          fr: 'Le portfolio sur un écran de téléphone',
          ar: 'الموقع على شاشة بحجم الهاتف',
        },
        phone: true,
      },
    ],
    github: 'https://github.com/georgio30/georgio-saliba-portfolio',
    live: 'https://georgio-saliba-portfolio.vercel.app',
    tone: '#efede7',
  },
]
