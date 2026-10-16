// "Under the hood": what is worth knowing about how this site is built. Text is { en, fr, ar }.

export const craftPoints = [
  {
    id: 'performance',
    title: { en: 'Performance', fr: 'Performance', ar: 'الأداء' },
    text: {
      en: 'The one library besides React is three.js, for the island at the top. It loads in its own chunk once the page has painted, and pauses when it’s off screen. There’s no animation or translation library: motion is a few lines of requestAnimationFrame and the translations are plain objects. Screenshots are WebP at two sizes and lazy-loaded, and the theme and language are applied before first paint so nothing flashes.',
      fr: 'La seule bibliothèque en plus de React est three.js, pour l’île en haut de page : elle se charge à part, une fois la page affichée, et se met en pause hors de l’écran. Aucune bibliothèque d’animation ni de traduction : le mouvement tient en quelques lignes de requestAnimationFrame et les traductions sont de simples objets. Les captures sont en WebP en deux tailles, chargées à la demande, et le thème comme la langue s’appliquent avant le premier affichage, sans scintillement.',
      ar: 'المكتبة الوحيدة إلى جانب React هي three.js للجزيرة في أعلى الصفحة، وتُحمَّل في جزء منفصل بعد ظهور الصفحة وتتوقف حين تخرج من الشاشة. لا مكتبة رسوم متحركة ولا ترجمة: الحركة بضعة أسطر من requestAnimationFrame والترجمات كائنات بسيطة. لقطات الشاشة بصيغة WebP بحجمين وتُحمَّل عند الحاجة، ويُطبَّق الوضع واللغة قبل أول عرض فلا يحدث وميض.',
    },
  },
  {
    id: 'responsive',
    title: { en: 'Responsive design', fr: 'Design responsive', ar: 'التصميم المتجاوب' },
    text: {
      en: 'Mobile-first layouts in Tailwind. The 3D archipelago is only loaded on desktops with a mouse; phones, tablets and touch screens get the plain headline and never download it. On phones the project list turns into cards that switch to a portrait screenshot when a project has one.',
      fr: 'Des mises en page pensées d’abord pour le mobile, avec Tailwind. L’archipel 3D n’est chargé que sur ordinateur avec une souris ; téléphones, tablettes et écrans tactiles gardent le titre simple et ne le téléchargent jamais. Sur téléphone, la liste des projets devient des cartes qui passent à une capture portrait quand le projet en a une.',
      ar: 'تخطيطات تبدأ من الهاتف باستخدام Tailwind. لا يُحمَّل الأرخبيل ثلاثي الأبعاد إلا على أجهزة الكمبيوتر المزوّدة بفأرة؛ أما الهواتف والأجهزة اللوحية والشاشات اللمسية فتعرض العنوان البسيط ولا تنزّله أبدًا. وعلى الهواتف تتحول قائمة المشاريع إلى بطاقات تعرض لقطة هاتف طولية إن وُجدت للمشروع.',
    },
  },
  {
    id: 'accessibility',
    title: { en: 'Accessibility', fr: 'Accessibilité', ar: 'سهولة الوصول' },
    text: {
      en: 'A skip link, visible focus rings and translated image descriptions. The project lightbox moves focus in, makes the page behind inert and gives focus back on close. Everything works by keyboard, the island included, and with reduced motion on, nothing drifts or idles.',
      fr: 'Un lien d’évitement, des contours de focus visibles et des descriptions d’images traduites. La visionneuse de projet déplace le focus, rend la page derrière inerte et le restitue à la fermeture. Tout fonctionne au clavier, l’île comprise, et avec le mouvement réduit, rien ne dérive ni ne s’anime tout seul.',
      ar: 'رابط لتخطي التنقل، وحدود تركيز واضحة، ووصف مترجم للصور. تنقل نافذة المشروع التركيز إليها وتجعل الصفحة خلفها غير تفاعلية وتعيد التركيز عند الإغلاق. كل شيء يعمل بلوحة المفاتيح، بما في ذلك الجزيرة، ومع تقليل الحركة لا شيء ينجرف أو يتحرك من تلقاء نفسه.',
    },
  },
  {
    id: 'multilingual',
    title: { en: 'Three languages', fr: 'Trois langues', ar: 'ثلاث لغات' },
    text: {
      en: 'English, French and Arabic without an i18n library. Interface text lives in one dictionary per language, content sits next to its data as { en, fr, ar }, and a missing translation falls back to English. First visits follow the browser language and the choice is remembered.',
      fr: 'Anglais, français et arabe sans bibliothèque d’i18n. Le texte de l’interface vit dans un dictionnaire par langue, le contenu est rangé avec ses données sous la forme { en, fr, ar }, et une traduction manquante retombe sur l’anglais. La première visite suit la langue du navigateur, et le choix est mémorisé.',
      ar: 'الإنجليزية والفرنسية والعربية دون مكتبة ترجمة. نصوص الواجهة في قاموس لكل لغة، والمحتوى بجانب بياناته بصيغة { en, fr, ar }، وأي ترجمة ناقصة تعود للإنجليزية. الزيارة الأولى تتبع لغة المتصفح ويُحفظ اختيارك.',
    },
  },
  {
    id: 'rtl',
    title: { en: 'Arabic, right to left', fr: 'Arabe, de droite à gauche', ar: 'العربية من اليمين إلى اليسار' },
    text: {
      en: 'A real right-to-left layout, not a mirrored screenshot: logical CSS (start and end instead of left and right), arrows that flip, swipes and arrow keys that follow the reading direction, and Arabic fonts that sit beside the Latin ones.',
      fr: 'Une vraie mise en page de droite à gauche, pas une capture inversée : CSS logique (début et fin plutôt que gauche et droite), flèches inversées, gestes et touches fléchées qui suivent le sens de lecture, et des polices arabes à côté des polices latines.',
      ar: 'تخطيط حقيقي من اليمين إلى اليسار لا صورة معكوسة: CSS منطقي (بداية ونهاية بدل يسار ويمين)، وأسهم تنقلب، وسحب ومفاتيح أسهم تتبع اتجاه القراءة، وخطوط عربية بجانب اللاتينية.',
    },
  },
]

export const challenges = [
  {
    title: { en: 'A 3D world that doesn’t cost the first paint', fr: 'Un monde 3D qui ne retarde pas le premier affichage', ar: 'عالم ثلاثي الأبعاد لا يؤخّر أول عرض' },
    problem: {
      en: 'three.js is heavier than the rest of the site put together, WebGL isn’t everywhere, and a canvas means nothing to a screen reader or a keyboard.',
      fr: 'three.js pèse plus que tout le reste du site, WebGL n’est pas disponible partout, et un canvas ne dit rien à un lecteur d’écran ni au clavier.',
      ar: 'مكتبة three.js أثقل من بقية الموقع مجتمعًا، وWebGL غير متاح في كل مكان، واللوحة (canvas) لا تعني شيئًا لقارئ الشاشة أو لوحة المفاتيح.',
    },
    solution: {
      en: 'The island is a dynamic import that starts once the browser is idle, in its own chunk, and pauses whenever it’s off screen or the tab is hidden. The labels are HTML buttons placed over the landmarks each frame, so Tab, Enter, screen readers, translation and right-to-left all work as they do everywhere else. Without WebGL the hero is just text.',
      fr: 'L’île est un import dynamique lancé quand le navigateur est inactif, dans son propre fichier, et se met en pause hors de l’écran ou quand l’onglet est caché. Les étiquettes sont des boutons HTML placés sur les repères à chaque image : Tab, Entrée, lecteurs d’écran, traduction et droite à gauche fonctionnent comme partout ailleurs. Sans WebGL, l’en-tête reste simplement du texte.',
      ar: 'الجزيرة استيراد ديناميكي يبدأ حين يتفرغ المتصفح، في ملف مستقل، وتتوقف حين تخرج من الشاشة أو يُخفى التبويب. التسميات أزرار HTML توضع فوق المعالم في كل إطار، فيعمل Tab وEnter وقارئ الشاشة والترجمة والاتجاه من اليمين إلى اليسار كما في بقية الموقع. ودون WebGL تبقى الواجهة نصًا فقط.',
    },
  },
  {
    title: { en: 'A lightbox that keeps your place', fr: 'Une visionneuse qui garde votre place', ar: 'نافذة تحفظ مكانك' },
    problem: {
      en: 'Opening a modal on a long, scroll-driven page can lose your scroll position, leave the page behind reachable by keyboard, and drop focus.',
      fr: 'Ouvrir une fenêtre modale sur une longue page pilotée par le défilement peut faire perdre la position, laisser la page derrière accessible au clavier et perdre le focus.',
      ar: 'فتح نافذة منبثقة في صفحة طويلة يقودها التمرير قد يضيّع موضعك، ويترك الصفحة خلفها قابلة للوصول بلوحة المفاتيح، ويفقد التركيز.',
    },
    solution: {
      en: 'The page is locked at its current scroll position and made inert while the dialog is open, focus moves into the dialog, and on close both the scroll position and the focused element are restored.',
      fr: 'La page est figée à sa position et rendue inerte tant que la fenêtre est ouverte, le focus entre dans la fenêtre, et à la fermeture la position comme l’élément focalisé sont restaurés.',
      ar: 'تُثبَّت الصفحة عند موضعها وتصبح غير تفاعلية أثناء فتح النافذة، وينتقل التركيز إليها، وعند الإغلاق يُستعاد الموضع والعنصر المركَّز عليه.',
    },
  },
  {
    title: { en: 'Right to left beyond the layout', fr: 'De droite à gauche, au-delà de la mise en page', ar: 'من اليمين إلى اليسار أبعد من التخطيط' },
    problem: {
      en: 'Flipping the layout is the easy part. Swipes, arrow keys, arrows and mixed Arabic and Latin text can still point the wrong way.',
      fr: 'Inverser la mise en page est la partie facile. Les gestes, les touches fléchées, les flèches et les textes mêlant arabe et latin peuvent encore aller dans le mauvais sens.',
      ar: 'قلب التخطيط هو الجزء السهل. قد تبقى حركات السحب ومفاتيح الأسهم والأسهم والنصوص المختلطة بين العربية واللاتينية في الاتجاه الخطأ.',
    },
    solution: {
      en: 'Direction is read from one place and passed to the gallery’s swipe and key handlers, decorative arrows flip with rtl: variants, and Latin-only text such as the logo stays left to right.',
      fr: 'Le sens est lu en un seul endroit et transmis aux gestes et aux touches de la galerie, les flèches décoratives s’inversent avec les variantes rtl:, et les textes purement latins, comme le logo, restent de gauche à droite.',
      ar: 'يُقرأ الاتجاه من مكان واحد ويُمرَّر إلى معالجات السحب والمفاتيح في المعرض، وتنقلب الأسهم الزخرفية عبر متغيرات rtl:، وتبقى النصوص اللاتينية الصرفة مثل الشعار من اليسار إلى اليمين.',
    },
  },
  {
    title: { en: 'A game that respects everyone', fr: 'Un jeu qui respecte tout le monde', ar: 'لعبة تحترم الجميع' },
    problem: {
      en: 'Snake is fast and visual, and it is easy to build it for one kind of player: someone with a keyboard and a mouse.',
      fr: 'Snake est rapide et visuel, et il est facile de le construire pour un seul type de joueur\u00a0: quelqu’un avec un clavier et une souris.',
      ar: 'لعبة الثعبان سريعة وبصرية، ومن السهل بناؤها للاعب واحد فقط: من لديه لوحة مفاتيح وفأرة.',
    },
    solution: {
      en: 'The board takes arrow keys, WASD, swipes and on-screen buttons, and results are announced through a live region. It pauses by itself when you scroll away or switch tabs, and it never keeps running out of sight.',
      fr: 'Le plateau accepte les flèches, WASD, les glissements et des boutons à l’écran, et les résultats sont annoncés par une région live. Il se met en pause tout seul quand vous faites défiler ou changez d’onglet, et ne tourne jamais hors de vue.',
      ar: 'تقبل اللوحة مفاتيح الأسهم وWASD والسحب وأزرارًا على الشاشة، وتُعلَن النتائج عبر منطقة حيّة. تتوقف مؤقتًا من تلقاء نفسها عند التمرير بعيدًا أو تبديل التبويب، ولا تستمر في العمل خارج النظر.',
    },
  },
]
