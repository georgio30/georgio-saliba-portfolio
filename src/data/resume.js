export const profile = {
  name: 'Georgio Saliba',
  role: 'Full-Stack Developer',
  location: 'Byblos, Lebanon',
  phone: '+961 71 503 736',
  phoneHref: 'tel:+96171503736',
  email: 'georgiosaliba@hotmail.com',
  linkedin: 'https://lb.linkedin.com/in/georgio-saliba-30265a2b4',
  github: 'https://github.com/georgio30',
  summary:
    'Full-stack developer who builds complete web applications end to end: relational databases in MySQL, REST APIs in Node.js and Express, and responsive interfaces in React and TypeScript. I care about clean architecture, secure authentication and shipping work that holds up.',
}

export const stats = [
  { value: '2', label: 'Internships' },
  { value: '3+', label: 'End-to-end apps' },
  { value: 'B.Sc.', label: 'Computer Science' },
]

export const experience = [
  {
    title: 'Frontend Developer Intern',
    company: 'York Press',
    period: '06/2026 – 09/2026',
    location: 'Zouk Mosbeh, Lebanon',
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
    title: 'Frontend Developer Intern',
    company: 'White Beard',
    period: '06/2024 – 09/2024',
    location: 'Beirut, Lebanon',
    points: [
      'Developed responsive and user-friendly web interfaces using HTML5, CSS3, and JavaScript following modern frontend practices.',
      'Created optimized layouts ensuring cross-device compatibility, accessibility, and consistent UX across screen sizes.',
      'Implemented interactive frontend features and UI enhancements to improve functionality, usability, and performance.',
      'Collaborated with team members to debug issues, test new features, and maintain existing web applications.',
      'Assisted with data management and database-related tasks to support application functionality.',
    ],
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Accessibility'],
  },
]

export const projects = [
  {
    name: 'Saliba Polyclinic',
    year: '2026',
    type: 'Full-stack web app',
    description:
      'A Polyclinic Management System with JWT authentication and role-based access control (RBAC) for managing patients, doctors and appointments.',
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'JWT'],
    icon: 'clinic',
  },
  {
    name: 'Iverse',
    year: '2025',
    type: 'E-commerce web app',
    description:
      'An online store with user authentication, product browsing, cart and checkout-style shopping features, styled with Tailwind CSS.',
    stack: ['React', 'Tailwind CSS', 'Node.js', 'Express', 'MySQL'],
    icon: 'cart',
  },
  {
    name: 'Recipe Finder',
    year: '2025',
    type: 'Cross-platform mobile app',
    description:
      'A recipe discovery app for iOS and Android with Firebase authentication and Spoonacular API integration.',
    stack: ['React Native', 'Firebase', 'Spoonacular API'],
    icon: 'recipe',
  },
]

export const skills = [
  { group: 'Languages', icon: 'code', items: ['JavaScript', 'TypeScript', 'Java', 'Python'] },
  { group: 'Backend & APIs', icon: 'server', items: ['Node.js', 'Express.js', 'REST APIs', 'JWT Auth', 'Role-Based Access (RBAC)'] },
  { group: 'Frontend & Mobile', icon: 'layout', items: ['React.js', 'React Native', 'Tailwind CSS', 'HTML5', 'CSS3'] },
  { group: 'Databases & Tools', icon: 'git', items: ['MySQL', 'Firebase', 'Git & GitHub', 'Agile', 'Code Reviews'] },
]

export const education = {
  degree: 'Bachelor of Science – Computer Science',
  school: 'AUL (Arts, Sciences & Technology University in Lebanon)',
  period: '10/2022 – 02/2026',
  location: 'Jounieh, Lebanon',
}

export const languages = [
  { name: 'Arabic', level: 'Native', value: 100 },
  { name: 'English', level: 'Proficient', value: 85 },
  { name: 'French', level: 'Proficient', value: 80 },
]
