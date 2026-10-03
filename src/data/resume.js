export const profile = {
  name: 'Georgio Saliba',
  role: 'Full-Stack Developer',
  location: 'Byblos, Lebanon',
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
    title: 'Frontend Developer Intern',
    company: 'York Press',
    period: '06/2026 – 09/2026',
    location: 'Zouk Mosbeh, Lebanon',
    // Shown in the Experience section; written from the points below
    headline: 'React and TypeScript, in production.',
    story:
      'I worked on production code that real users rely on: reusable, responsive interfaces in React and TypeScript, state managed with hooks, and REST APIs wired in with proper loading and error states. Every change went through a branch, a pull request and a code review.',
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
    headline: 'Layouts that hold up on every screen.',
    story:
      'I built responsive, accessible interfaces in HTML, CSS and JavaScript, added interactive features, and helped the team debug, test and maintain its web apps, including some of the database work behind them.',
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

export const skills = [
  { group: 'Languages', items: ['JavaScript', 'TypeScript', 'Java', 'Python'] },
  { group: 'Backend & APIs', items: ['Node.js', 'Express.js', 'REST APIs', 'JWT Auth', 'Role-Based Access (RBAC)'] },
  { group: 'Frontend & Mobile', items: ['React.js', 'React Native', 'Tailwind CSS', 'HTML5', 'CSS3'] },
  { group: 'Databases & Tools', items: ['MySQL', 'Firebase', 'Git & GitHub', 'Agile', 'Code Reviews'] },
]

// The short list shown in About; `skills` above is the full CV version
export const toolbox = ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'REST APIs', 'JWT & role-based access', 'Tailwind CSS', 'React Native', 'Git']

export const education = {
  degree: 'Bachelor of Science – Computer Science',
  school: 'AUL (Arts, Sciences & Technology University in Lebanon)',
  period: '10/2022 – 02/2026',
  location: 'Jounieh, Lebanon',
}

export const languages = [
  { name: 'Arabic', level: 'Native' },
  { name: 'English', level: 'Proficient' },
  { name: 'French', level: 'Proficient' },
]
