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
    - caseStudy (optional): { problem, approach: [steps], result }, shown in the
      project lightbox. Each is text or { en, fr, ar }; approach is a list.
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
    caseStudy: {
      problem: {
        en: 'A clinic has to keep patients, doctors and appointments in one place, and each person should only ever see what their role allows.',
        fr: 'Une clinique doit garder patients, médecins et rendez-vous au même endroit, et chacun ne doit voir que ce que son rôle permet.',
        ar: 'تحتاج العيادة إلى جمع المرضى والأطباء والمواعيد في مكان واحد، ويجب ألا يرى كل شخص إلا ما يسمح به دوره.',
      },
      approach: {
        en: [
          'Designed the MySQL schema first, so patients, doctors and appointments relate cleanly.',
          'Signed users in with JWT and checked their role on every Express route, not just in the interface.',
          'Built the React and TypeScript interface around roles, so each one gets its own screens.',
        ],
        fr: [
          'Conçu d’abord le schéma MySQL, pour que patients, médecins et rendez-vous soient reliés proprement.',
          'Connecté les utilisateurs avec JWT et vérifié leur rôle sur chaque route Express, pas seulement dans l’interface.',
          'Construit l’interface React et TypeScript autour des rôles, avec des écrans propres à chacun.',
        ],
        ar: [
          'صمّمتُ مخطط MySQL أولًا ليرتبط المرضى والأطباء والمواعيد بشكل سليم.',
          'سجّلتُ دخول المستخدمين عبر JWT وتحققتُ من دورهم في كل مسار Express وليس في الواجهة فقط.',
          'بنيتُ واجهة React وTypeScript حول الأدوار ليحصل كل دور على شاشاته.',
        ],
      },
      result: {
        en: 'A working clinic system where access is enforced by the server, so hiding a button is never the only protection.',
        fr: 'Un système de clinique fonctionnel où l’accès est imposé par le serveur : masquer un bouton n’est jamais la seule protection.',
        ar: 'نظام عيادة يعمل ويُفرض فيه الوصول من الخادم، فلا يكون إخفاء زر هو الحماية الوحيدة.',
      },
    },
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
    caseStudy: {
      problem: {
        en: 'An online store only works if browsing, the cart and checkout feel like one continuous flow tied to a signed-in user.',
        fr: 'Une boutique en ligne ne fonctionne que si la navigation, le panier et le paiement forment un seul parcours continu, lié à un utilisateur connecté.',
        ar: 'لا ينجح المتجر الإلكتروني إلا إذا بدت عملية التصفّح والسلة والدفع مسارًا واحدًا متصلًا بمستخدم مسجّل.',
      },
      approach: {
        en: [
          'Modelled users, products and orders in MySQL and exposed them through an Express API.',
          'Added user authentication so carts and orders belong to a person.',
          'Styled the React interface with Tailwind CSS so the same components hold up on phone and desktop.',
        ],
        fr: [
          'Modélisé utilisateurs, produits et commandes dans MySQL, exposés par une API Express.',
          'Ajouté l’authentification pour que paniers et commandes appartiennent à une personne.',
          'Stylisé l’interface React avec Tailwind CSS pour que les mêmes composants tiennent sur téléphone comme sur ordinateur.',
        ],
        ar: [
          'نمذجتُ المستخدمين والمنتجات والطلبات في MySQL وعرضتُها عبر واجهة Express.',
          'أضفتُ مصادقة المستخدمين لتنتمي السلات والطلبات إلى شخص.',
          'صمّمتُ واجهة React بـ Tailwind CSS لتصمد المكونات نفسها على الهاتف والحاسوب.',
        ],
      },
      result: {
        en: 'A store you can sign in to, browse, fill a cart in and check out of, built end to end from database to interface.',
        fr: 'Une boutique où l’on se connecte, parcourt le catalogue, remplit un panier et passe commande, construite de bout en bout, de la base de données à l’interface.',
        ar: 'متجر تسجّل الدخول إليه وتتصفّحه وتملأ سلته وتُنهي الشراء، مبني من البداية للنهاية من قاعدة البيانات إلى الواجهة.',
      },
    },
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
    caseStudy: {
      problem: {
        en: 'Deciding what to cook is easier when recipes are in your pocket, on whichever phone you own.',
        fr: 'Choisir quoi cuisiner est plus simple quand les recettes sont dans la poche, quel que soit le téléphone.',
        ar: 'يسهل اختيار ما تطبخه عندما تكون الوصفات في جيبك، على أي هاتف تملكه.',
      },
      approach: {
        en: [
          'Chose React Native so one codebase serves both iOS and Android.',
          'Used Firebase for sign-in instead of building an auth server for a small app.',
          'Pulled recipe data from the Spoonacular API and handled loading and empty states in the interface.',
        ],
        fr: [
          'Choisi React Native pour qu’une seule base de code serve iOS et Android.',
          'Utilisé Firebase pour la connexion plutôt que de bâtir un serveur d’authentification pour une petite appli.',
          'Récupéré les recettes via l’API Spoonacular, avec des états de chargement et de résultat vide dans l’interface.',
        ],
        ar: [
          'اخترتُ React Native لتخدم قاعدة شيفرة واحدة iOS وAndroid.',
          'استخدمتُ Firebase لتسجيل الدخول بدل بناء خادم مصادقة لتطبيق صغير.',
          'جلبتُ بيانات الوصفات من واجهة Spoonacular وعالجتُ حالات التحميل والنتائج الفارغة في الواجهة.',
        ],
      },
      result: {
        en: 'A recipe discovery app that runs on both platforms from a single codebase.',
        fr: 'Une application de découverte de recettes qui tourne sur les deux plateformes avec une seule base de code.',
        ar: 'تطبيق لاكتشاف الوصفات يعمل على المنصتين من قاعدة شيفرة واحدة.',
      },
    },
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
    caseStudy: {
      problem: {
        en: 'A developer portfolio is easy to scroll past. I wanted something memorable, without animation libraries slowing it down or shutting out visitors who use a keyboard, a phone or Arabic.',
        fr: 'Un portfolio de développeur se survole facilement. Je voulais quelque chose de mémorable, sans bibliothèque d’animation qui le ralentisse ni visiteurs laissés de côté, qu’ils utilisent le clavier, un téléphone ou l’arabe.',
        ar: 'من السهل تجاوز معرض أعمال المطوّرين بالتمرير. أردتُ شيئًا لا يُنسى، دون مكتبات رسوم تبطّئه أو تُقصي من يستخدمون لوحة المفاتيح أو الهاتف أو العربية.',
      },
      approach: {
        en: [
          'Drove the 3D gallery from scroll position with plain CSS transforms, with lighter versions for phones and reduced motion.',
          'Built English, French and Arabic in from the start, including a true right-to-left layout.',
          'Treated accessibility and image weight as features: focus management, keyboard use, responsive WebP.',
        ],
        fr: [
          'Piloté la galerie 3D par le défilement avec de simples transformations CSS, et des versions plus légères pour téléphone et mouvement réduit.',
          'Intégré dès le départ l’anglais, le français et l’arabe, avec une vraie mise en page de droite à gauche.',
          'Traité l’accessibilité et le poids des images comme des fonctionnalités : gestion du focus, clavier, WebP adaptatif.',
        ],
        ar: [
          'قُدتُ المعرض ثلاثي الأبعاد بموضع التمرير وتحويلات CSS بسيطة، مع نسخ أخف للهواتف وتقليل الحركة.',
          'بنيتُ الإنجليزية والفرنسية والعربية منذ البداية، بما في ذلك تخطيط حقيقي من اليمين إلى اليسار.',
          'عاملتُ سهولة الوصول ووزن الصور كميزات: إدارة التركيز، ولوحة المفاتيح، وWebP متجاوب.',
        ],
      },
      result: {
        en: 'The site you are on: a one-page portfolio in three languages that is light on dependencies and works with keyboard, touch and reduced motion.',
        fr: 'Le site que vous parcourez : un portfolio d’une page en trois langues, léger en dépendances, qui fonctionne au clavier, au toucher et avec le mouvement réduit.',
        ar: 'الموقع الذي تتصفّحه: معرض من صفحة واحدة بثلاث لغات، خفيف الاعتماديات، يعمل بلوحة المفاتيح واللمس وتقليل الحركة.',
      },
    },
  },
]
