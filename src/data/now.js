// What the "Now" strip and the interactive About tabs say. Edit this file to keep the site current.
// Text is { en, fr, ar }, like the rest of the data (see src/i18n).

// Year and month of the last edit, shown as "Updated October 2026"
export const nowUpdated = '2026-10'

export const now = [
  {
    label: { en: 'Building', fr: 'Je construis', ar: 'أبني' },
    text: {
      en: 'Case studies and a small game for this portfolio, and polishing Saliba Polyclinic.',
      fr: 'Des études de cas et un petit jeu pour ce portfolio, et la finition de Saliba Polyclinic.',
      ar: 'دراسات حالة ولعبة صغيرة لهذا الموقع، ولمسات أخيرة على Saliba Polyclinic.',
    },
  },
  {
    label: { en: 'Exploring', fr: 'J’explore', ar: 'أستكشف' },
    text: {
      en: 'Interfaces that feel just as good in English, French and right-to-left Arabic.',
      fr: 'Des interfaces tout aussi agréables en anglais, en français et en arabe de droite à gauche.',
      ar: 'واجهات مريحة بالقدر نفسه بالإنجليزية والفرنسية والعربية من اليمين إلى اليسار.',
    },
  },
  {
    label: { en: 'Open to', fr: 'Ouvert à', ar: 'متاح لـ' },
    text: {
      en: 'Full-stack roles, from database to interface, and projects worth building well.',
      fr: 'Des postes full-stack, de la base de données à l’interface, et des projets qui méritent d’être bien construits.',
      ar: 'وظائف Full-Stack، من قاعدة البيانات إلى الواجهة، ومشاريع تستحق أن تُبنى جيدًا.',
    },
  },
]

// The interactive About: "Technologies" is built from projects.js and resume.js, so it has no list here
export const aboutTabs = [
  {
    id: 'building',
    items: [
      {
        title: 'Saliba Polyclinic',
        text: {
          en: 'A clinic system where every role signs in to its own view of patients, doctors and appointments.',
          fr: 'Un système de clinique où chaque rôle se connecte à sa propre vue des patients, médecins et rendez-vous.',
          ar: 'نظام عيادة يدخل فيه كل دور إلى واجهته الخاصة للمرضى والأطباء والمواعيد.',
        },
      },
      {
        title: { en: 'This portfolio', fr: 'Ce portfolio', ar: 'هذا الموقع' },
        text: {
          en: 'Turning a gallery into an experience: case studies, a game and a look at how the site is made.',
          fr: 'Transformer une galerie en expérience : études de cas, un jeu et un regard sur la fabrication du site.',
          ar: 'تحويل المعرض إلى تجربة: دراسات حالة، ولعبة، ونظرة على كيفية بناء الموقع.',
        },
      },
    ],
  },
  {
    id: 'experimenting',
    items: [
      {
        title: { en: 'Scroll-driven 3D', fr: 'La 3D pilotée par le défilement', ar: 'ثلاثي الأبعاد مع التمرير' },
        text: {
          en: 'How far plain CSS transforms can go before a 3D library is worth it.',
          fr: 'Jusqu’où les transformations CSS suffisent avant qu’une bibliothèque 3D en vaille la peine.',
          ar: 'إلى أي مدى تكفي تحويلات CSS قبل أن تستحق مكتبة ثلاثية الأبعاد العناء.',
        },
      },
      {
        title: { en: 'Right-to-left design', fr: 'Le design de droite à gauche', ar: 'التصميم من اليمين إلى اليسار' },
        text: {
          en: 'Mirroring what should mirror (layout, arrows, swipes) and leaving the rest alone.',
          fr: 'Inverser ce qui doit l’être (mise en page, flèches, gestes) et laisser le reste tranquille.',
          ar: 'عكس ما يجب عكسه (التخطيط والأسهم والسحب) وترك الباقي كما هو.',
        },
      },
      {
        title: { en: 'Inclusive interaction', fr: 'Des interactions inclusives', ar: 'تفاعل للجميع' },
        text: {
          en: 'Keyboard, screen reader and reduced-motion support in things that are meant to be playful.',
          fr: 'Clavier, lecteur d’écran et mouvement réduit, même dans ce qui est fait pour jouer.',
          ar: 'دعم لوحة المفاتيح وقارئ الشاشة وتقليل الحركة حتى فيما صُمّم للمرح.',
        },
      },
    ],
  },
]

// Technologies listed in the About tab; each shows the projects and jobs that use it
export const enjoyedTech = ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'Tailwind CSS', 'React Native', 'JWT', 'Firebase', 'Vite']
