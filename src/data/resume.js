// Text shown on the site is either one value for every language or { en, fr, ar } (see src/i18n)
export const profile = {
  name: { en: 'Georgio Saliba', fr: 'Georgio Saliba', ar: 'جورجيو صليبا' },
  role: { en: 'Full-Stack Developer', fr: 'Développeur Full-Stack', ar: 'مطوّر Full-Stack' },
  location: { en: 'Byblos, Lebanon', fr: 'Byblos, Liban', ar: 'جبيل، لبنان' },
  phone: '+961 71 503 736',
  phoneHref: 'tel:+96171503736',
  email: 'georgiosaliba@hotmail.com',
  linkedin: 'https://lb.linkedin.com/in/georgio-saliba-30265a2b4',
  github: 'https://github.com/georgio30',
  // Shown in About as "Currently learning" when filled in, e.g. ['Next.js', 'Docker']
  learning: [],
  summary:
    'Full-stack developer who builds complete web applications end to end: relational databases in MySQL, REST APIs in Node.js and Express, and responsive interfaces in React and TypeScript. I care about clean architecture, secure authentication and shipping work that holds up.',
}

export const experience = [
  {
    title: {
      en: 'Frontend Developer Intern',
      fr: 'Stagiaire développeur front-end',
      ar: 'متدرّب في تطوير الواجهات الأمامية',
    },
    company: 'York Press',
    period: '06/2026 – 09/2026',
    location: { en: 'Zouk Mosbeh, Lebanon', fr: 'Zouk Mosbeh, Liban', ar: 'ذوق مصبح، لبنان' },
    // Shown in the Experience section; written from the points below
    headline: {
      en: 'React and TypeScript, in production.',
      fr: 'React et TypeScript, en production.',
      ar: 'React وTypeScript، في بيئة الإنتاج.',
    },
    story: {
      en: 'I worked on production code that real users rely on: reusable, responsive interfaces in React and TypeScript, state managed with hooks, and REST APIs wired in with proper loading and error states. Every change went through a branch, a pull request and a code review.',
      fr: 'J’ai travaillé sur du code en production dont de vrais utilisateurs dépendent\u00a0: des interfaces réutilisables et responsives en React et TypeScript, un état géré avec les hooks, et des API REST branchées avec de vrais états de chargement et d’erreur. Chaque modification passait par une branche, une pull request et une revue de code.',
      ar: 'عملتُ على شيفرة في بيئة الإنتاج يعتمد عليها مستخدمون حقيقيون: واجهات متجاوبة وقابلة لإعادة الاستخدام بـ React وTypeScript، وإدارة الحالة عبر الـ Hooks، وربط واجهات REST البرمجية مع معالجة سليمة لحالات التحميل والأخطاء. كل تعديل مرّ عبر فرع وطلب دمج ومراجعة للشيفرة.',
    },
    // CV wording, not shown on the site (English only)
    points: [
      'Developed and maintained responsive, reusable user interfaces using React.js, TypeScript, and modern JavaScript (ES6+).',
      'Built modular component-based architectures using React Hooks (useState, useEffect, useContext) for state management and lifecycle handling.',
      'Integrated RESTful APIs with asynchronous JavaScript, handling data fetching, loading states, and error management.',
      'Collaborated using Git workflows including branching, pull requests, code reviews, merging, and conflict resolution.',
      'Debugged, tested, and optimized React applications following clean code principles and Agile practices.',
    ],
    tags: ['React', 'TypeScript', 'REST APIs', 'Git'],
  },
  {
    title: {
      en: 'Frontend Developer Intern',
      fr: 'Stagiaire développeur front-end',
      ar: 'متدرّب في تطوير الواجهات الأمامية',
    },
    company: 'White Beard',
    period: '06/2024 – 09/2024',
    location: { en: 'Beirut, Lebanon', fr: 'Beyrouth, Liban', ar: 'بيروت، لبنان' },
    headline: {
      en: 'Layouts that hold up on every screen.',
      fr: 'Des mises en page qui tiennent sur tous les écrans.',
      ar: 'تصاميم تصمد على كل الشاشات.',
    },
    story: {
      en: 'I built responsive, accessible interfaces in HTML, CSS and JavaScript, added interactive features, and helped the team debug, test and maintain its web apps, including some of the database work behind them.',
      fr: 'J’ai construit des interfaces responsives et accessibles en HTML, CSS et JavaScript, ajouté des fonctionnalités interactives, et aidé l’équipe à déboguer, tester et maintenir ses applications web, y compris une partie du travail sur les bases de données.',
      ar: 'بنيتُ واجهات متجاوبة وسهلة الوصول بـ HTML وCSS وJavaScript، وأضفتُ ميزات تفاعلية، وساعدتُ الفريق في تصحيح تطبيقاته واختبارها وصيانتها، بما في ذلك بعض أعمال قواعد البيانات التي تقف خلفها.',
    },
    points: [
      'Developed responsive and user-friendly web interfaces using HTML5, CSS3, and JavaScript following modern frontend practices.',
      'Created optimized layouts ensuring cross-device compatibility, accessibility, and consistent UX across screen sizes.',
      'Implemented interactive frontend features and UI enhancements to improve functionality, usability, and performance.',
      'Collaborated with team members to debug issues, test new features, and maintain existing web applications.',
      'Assisted with data management and database-related tasks to support application functionality.',
    ],
    tags: ['HTML5', 'CSS3', 'JavaScript', { en: 'Accessibility', fr: 'Accessibilité', ar: 'سهولة الوصول' }],
  },
]

export const skills = [
  { group: 'Languages', items: ['JavaScript', 'TypeScript', 'Java', 'Python'] },
  { group: 'Backend & APIs', items: ['Node.js', 'Express.js', 'REST APIs', 'JWT Auth', 'Role-Based Access (RBAC)'] },
  { group: 'Frontend & Mobile', items: ['React.js', 'React Native', 'Tailwind CSS', 'HTML5', 'CSS3'] },
  { group: 'Databases & Tools', items: ['MySQL', 'Firebase', 'Git & GitHub', 'Agile', 'Code Reviews'] },
]

// The short list shown in About; `skills` above is the full CV version
export const toolbox = [
  'React',
  'TypeScript',
  'Node.js',
  'Express',
  'MySQL',
  'REST APIs',
  { en: 'JWT & role-based access', fr: 'JWT et accès par rôle', ar: 'JWT وصلاحيات حسب الدور' },
  'Tailwind CSS',
  'React Native',
  'Git',
]

export const education = {
  degree: 'Bachelor of Science – Computer Science',
  school: 'AUL (Arts, Sciences & Technology University in Lebanon)',
  period: '10/2022 – 02/2026',
  location: 'Jounieh, Lebanon',
}

export const languages = [
  { name: { en: 'Arabic', fr: 'Arabe', ar: 'العربية' }, level: 'Native' },
  { name: { en: 'English', fr: 'Anglais', ar: 'الإنجليزية' }, level: 'Proficient' },
  { name: { en: 'French', fr: 'Français', ar: 'الفرنسية' }, level: 'Proficient' },
]
