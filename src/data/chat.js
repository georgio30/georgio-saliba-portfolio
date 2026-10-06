// The questions the chat offers, with ready-written answers. No AI behind it: edit the text here.
// Text is { en, fr, ar }. `action` adds a button under the answer (a section or a mailto link).
import { profile } from './resume'

export const chatQuestions = [
  {
    id: 'who',
    q: { en: 'Who are you?', fr: 'Qui êtes-vous ?', ar: 'من أنت؟' },
    a: {
      en: 'I’m Georgio, a full-stack developer from Byblos, Lebanon. I build web apps from the database up: React and TypeScript interfaces on Node.js and Express APIs with MySQL. I studied Computer Science at AUL, and I speak Arabic, English and French.',
      fr: 'Je suis Georgio, développeur full-stack de Byblos, au Liban. Je construis des applications web de la base de données jusqu’à l’interface : React et TypeScript sur des API Node.js et Express avec MySQL. J’ai étudié l’informatique à l’AUL, et je parle arabe, anglais et français.',
      ar: 'أنا جورجيو، مطوّر Full-Stack من جبيل في لبنان. أبني تطبيقات الويب انطلاقًا من قاعدة البيانات: واجهات React وTypeScript فوق واجهات Node.js وExpress مع MySQL. درستُ علوم الكمبيوتر في AUL، وأتحدث العربية والإنجليزية والفرنسية.',
    },
    action: { href: '#about', label: { en: 'More about me', fr: 'En savoir plus sur moi', ar: 'المزيد عني' } },
  },
  {
    id: 'built',
    q: { en: 'What have you built?', fr: 'Qu’avez-vous construit ?', ar: 'ماذا بنيت؟' },
    a: {
      en: 'Four things so far: Saliba Polyclinic (a clinic system with role-based logins), Iverse (an online store), Recipe Finder (a React Native app for iOS and Android) and this portfolio. Each one opens with a short case study.',
      fr: 'Quatre choses jusqu’ici : Saliba Polyclinic (un système de clinique avec connexions par rôle), Iverse (une boutique en ligne), Recipe Finder (une appli React Native pour iOS et Android) et ce portfolio. Chacun s’ouvre sur une courte étude de cas.',
      ar: 'أربعة أشياء حتى الآن: Saliba Polyclinic (نظام عيادة بتسجيل دخول حسب الدور)، وIverse (متجر إلكتروني)، وRecipe Finder (تطبيق React Native لـ iOS وAndroid)، وهذا الموقع. يفتح كل مشروع بدراسة حالة قصيرة.',
    },
    action: { href: '#work', label: { en: 'See the projects', fr: 'Voir les projets', ar: 'شاهد المشاريع' } },
  },
  {
    id: 'stack',
    q: { en: 'What’s your tech stack?', fr: 'Quelle est votre stack ?', ar: 'ما التقنيات التي تستخدمها؟' },
    a: {
      en: 'Front end: React, TypeScript and Tailwind CSS. Back end: Node.js, Express and REST APIs, with JWT sign-in and role-based access. Data: MySQL, plus Firebase on mobile. I also use React Native and Git every day.',
      fr: 'Front-end : React, TypeScript et Tailwind CSS. Back-end : Node.js, Express et API REST, avec connexion JWT et accès par rôle. Données : MySQL, et Firebase sur mobile. J’utilise aussi React Native et Git au quotidien.',
      ar: 'الواجهة الأمامية: React وTypeScript وTailwind CSS. الخلفية: Node.js وExpress وواجهات REST، مع تسجيل دخول JWT وصلاحيات حسب الدور. البيانات: MySQL، وFirebase على الجوّال. كما أستخدم React Native وGit يوميًا.',
    },
    action: { href: '#about', label: { en: 'Browse the technologies', fr: 'Parcourir les technologies', ar: 'تصفّح التقنيات' } },
  },
  {
    id: 'experience',
    q: { en: 'What experience do you have?', fr: 'Quelle expérience avez-vous ?', ar: 'ما خبرتك؟' },
    a: {
      en: 'Two summer internships as a frontend developer. At York Press (2026) I worked on React and TypeScript in production, with pull requests and code reviews. At White Beard (2024) I built responsive, accessible interfaces in HTML, CSS and JavaScript.',
      fr: 'Deux stages d’été comme développeur front-end. Chez York Press (2026), j’ai travaillé sur du React et TypeScript en production, avec pull requests et revues de code. Chez White Beard (2024), j’ai construit des interfaces responsives et accessibles en HTML, CSS et JavaScript.',
      ar: 'تدريبان صيفيان في تطوير الواجهات الأمامية. في York Press (2026) عملتُ على React وTypeScript في بيئة الإنتاج، مع طلبات الدمج ومراجعة الشيفرة. وفي White Beard (2024) بنيتُ واجهات متجاوبة وسهلة الوصول بـ HTML وCSS وJavaScript.',
    },
    action: { href: '#experience', label: { en: 'See the experience', fr: 'Voir l’expérience', ar: 'شاهد الخبرة' } },
  },
  {
    id: 'hire',
    q: {
      en: 'Are you open to work?',
      fr: 'Êtes-vous ouvert à de nouvelles opportunités ?',
      ar: 'هل أنت متاح للعمل؟',
    },
    a: {
      en: `Yes. I’m open to full-stack roles, front to back, and to projects worth building well. Email is the quickest way to reach me: ${profile.email}.`,
      fr: `Oui. Je suis ouvert aux postes full-stack, du front au back, et aux projets qui méritent d’être bien construits. L’e-mail est le moyen le plus rapide de me joindre : ${profile.email}.`,
      ar: `نعم. أنا متاح لوظائف Full-Stack، من الواجهة إلى الخلفية، ولمشاريع تستحق أن تُبنى جيدًا. البريد الإلكتروني أسرع طريقة للتواصل معي: ${profile.email}.`,
    },
    action: { href: `mailto:${profile.email}`, label: { en: 'Send an email', fr: 'Envoyer un e-mail', ar: 'أرسل بريدًا إلكترونيًا' } },
  },
]
