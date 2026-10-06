// "Under the hood": what is worth knowing about how this site is built. Text is { en, fr, ar }.

export const craftPoints = [
  {
    id: 'performance',
    title: { en: 'Performance', fr: 'Performance', ar: 'الأداء' },
    text: {
      en: 'No animation, 3D or translation library: the gallery is plain CSS transforms and the translations are plain objects, so the page ships React and little else. Screenshots are WebP at two sizes and lazy-loaded, and the theme and language are applied before first paint so nothing flashes.',
      fr: 'Aucune bibliothèque d’animation, de 3D ou de traduction : la galerie repose sur des transformations CSS et les traductions sont de simples objets, la page n’embarque donc presque que React. Les captures sont en WebP en deux tailles, chargées à la demande, et le thème comme la langue s’appliquent avant le premier affichage, sans scintillement.',
      ar: 'لا مكتبة رسوم متحركة ولا ثلاثية الأبعاد ولا ترجمة: المعرض تحويلات CSS والترجمات كائنات بسيطة، فلا تحمل الصفحة سوى React تقريبًا. لقطات الشاشة بصيغة WebP بحجمين وتُحمَّل عند الحاجة، ويُطبَّق الوضع واللغة قبل أول عرض فلا يحدث وميض.',
    },
  },
  {
    id: 'responsive',
    title: { en: 'Responsive design', fr: 'Design responsive', ar: 'التصميم المتجاوب' },
    text: {
      en: 'Mobile-first layouts in Tailwind. On phones the 3D gallery gets a flatter, shallower version, and its cards switch to a portrait phone screenshot when a project has one.',
      fr: 'Des mises en page pensées d’abord pour le mobile, avec Tailwind. Sur téléphone, la galerie 3D devient plus plate et moins profonde, et ses cartes passent à une capture portrait quand le projet en a une.',
      ar: 'تخطيطات تبدأ من الهاتف باستخدام Tailwind. على الهواتف يصبح المعرض ثلاثي الأبعاد أكثر تسطّحًا وأقل عمقًا، وتتحول بطاقاته إلى لقطة هاتف طولية إن وُجدت للمشروع.',
    },
  },
  {
    id: 'accessibility',
    title: { en: 'Accessibility', fr: 'Accessibilité', ar: 'سهولة الوصول' },
    text: {
      en: 'A skip link, visible focus rings and translated image descriptions. The project lightbox moves focus in, makes the page behind inert and gives focus back on close. Everything works by keyboard, and with reduced motion on, the 3D gallery becomes a plain list and the game stops animating.',
      fr: 'Un lien d’évitement, des contours de focus visibles et des descriptions d’images traduites. La visionneuse de projet déplace le focus, rend la page derrière inerte et le restitue à la fermeture. Tout fonctionne au clavier, et avec le mouvement réduit, la galerie 3D devient une simple liste et le jeu n’anime plus.',
      ar: 'رابط لتخطي التنقل، وحدود تركيز واضحة، ووصف مترجم للصور. تنقل نافذة المشروع التركيز إليها وتجعل الصفحة خلفها غير تفاعلية وتعيد التركيز عند الإغلاق. كل شيء يعمل بلوحة المفاتيح، ومع تقليل الحركة يتحول المعرض ثلاثي الأبعاد إلى قائمة بسيطة وتتوقف اللعبة عن الحركة.',
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
    title: { en: 'A 3D gallery with no 3D library', fr: 'Une galerie 3D sans bibliothèque 3D', ar: 'معرض ثلاثي الأبعاد دون مكتبة' },
    problem: {
      en: 'Scroll-linked 3D usually means a heavy dependency, and it still has to work on phones and for people who ask for less motion.',
      fr: 'La 3D liée au défilement implique souvent une dépendance lourde, et elle doit quand même fonctionner sur téléphone et pour ceux qui demandent moins de mouvement.',
      ar: 'التأثيرات ثلاثية الأبعاد المرتبطة بالتمرير تعني عادةً مكتبة ثقيلة، ويجب أن تعمل على الهواتف ولمن يطلبون حركة أقل.',
    },
    solution: {
      en: 'Each card’s position is computed from the scroll offset and written straight to its CSS transform inside requestAnimationFrame, so React never re-renders while scrolling. Phones get a shallower scene, and reduced motion gets a plain list.',
      fr: 'La position de chaque carte est calculée depuis le défilement et écrite directement dans sa transformation CSS dans requestAnimationFrame, donc React ne se redessine pas pendant le défilement. Les téléphones ont une scène moins profonde, et le mouvement réduit une simple liste.',
      ar: 'يُحسب موضع كل بطاقة من موضع التمرير ويُكتب مباشرة في تحويل CSS داخل requestAnimationFrame، فلا يعيد React الرسم أثناء التمرير. الهواتف تحصل على مشهد أقل عمقًا، وتقليل الحركة يعطي قائمة بسيطة.',
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
      en: 'A memory game is visual by nature, which makes it easy to build for mouse users only.',
      fr: 'Un jeu de mémoire est visuel par nature, ce qui le rend facile à construire pour les seuls utilisateurs de souris.',
      ar: 'لعبة الذاكرة بصرية بطبيعتها، فمن السهل بناؤها لمستخدمي الفأرة فقط.',
    },
    solution: {
      en: 'Cards are real buttons with spoken labels, results are announced through a live region, and flips are instant when reduced motion is on. The board is a normal tab sequence, so it plays by keyboard too.',
      fr: 'Les cartes sont de vrais boutons avec des libellés vocalisés, les résultats sont annoncés par une région live, et les retournements sont instantanés avec le mouvement réduit. Le plateau suit l’ordre de tabulation normal, on peut donc y jouer au clavier.',
      ar: 'البطاقات أزرار حقيقية بتسميات منطوقة، وتُعلَن النتائج عبر منطقة حيّة، وتكون الحركة فورية عند تقليل الحركة. اللوحة تتبع ترتيب Tab العادي فيمكن اللعب بلوحة المفاتيح أيضًا.',
    },
  },
]
