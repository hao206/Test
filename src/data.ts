import { Project, Task, Post, Resource, SkillExchangeOffer, AuditLog } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'UTT Course Planner & Scheduler',
    description: 'An AI-powered automated scheduling platform that helps UTT students generate optimized semester planners according to registered course timetables.',
    category: 'Web Application',
    requiredSkills: ['React', 'NodeJS', 'MySQL', 'Tailwind'],
    deadline: '2026-07-15',
    teamSize: 4,
    progress: 75,
    status: 'Active',
    leaderId: 'u1',
    leaderName: 'Alex Nguyen'
  },
  {
    id: 'p2',
    name: 'Smart Campus IoT Parking System',
    description: 'Using ultrasonic sensors and microcontrollers integrated with an Express gateway to track real-time parking spaces availability at University Parking Lot.',
    category: 'IoT & Hardware',
    requiredSkills: ['Python', 'C++', 'Java', 'SQL'],
    deadline: '2026-08-10',
    teamSize: 5,
    progress: 40,
    status: 'Recruiting',
    leaderId: 'u3',
    leaderName: 'Minh Hoang'
  },
  {
    id: 'p3',
    name: 'Decentralized Academic Certificate Vault',
    description: 'A system utilizing cryptographic chains to publish and securely query authenticated degree templates and achievement certification badges.',
    category: 'Blockchain',
    requiredSkills: ['JavaScript', 'HTML', 'CSS', 'NodeJS'],
    deadline: '2026-06-30',
    teamSize: 3,
    progress: 95,
    status: 'Completed',
    leaderId: 'u4',
    leaderName: 'Linh Dang'
  },
  {
    id: 'p4',
    name: 'Multi-agent AI Personal Tutor Bot',
    description: 'Enabling freshmen to ask instant academic questions about programming principles, mathematics, and database management matching with course material text archives.',
    category: 'Artificial Intelligence',
    requiredSkills: ['Python', 'MySQL', 'React', 'UI/UX'],
    deadline: '2026-10-12',
    teamSize: 6,
    progress: 15,
    status: 'Recruiting',
    leaderId: 'u2',
    leaderName: 'Tomas Ly'
  },
  {
    id: 'p5',
    name: 'UTT Student Shuttle Live Tracker',
    description: 'Real-time GPS tracking application designed for transport vans cruising between inner-city facilities and student housing centers.',
    category: 'Mobile Application',
    requiredSkills: ['React Native', 'NodeJS', 'PostgreSQL'],
    deadline: '2025-12-15',
    teamSize: 4,
    progress: 100,
    status: 'Archived',
    leaderId: 'u5',
    leaderName: 'Phuong Mai'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    projectName: 'UTT Course Planner & Scheduler',
    title: 'Secure JWT Authentication Middleware',
    description: 'Implement rigorous role-based access tokens on the Node Express server. Set up token rotators and blacklist stores with SQL queries verification.',
    priority: 'High',
    status: 'Doing',
    assignedTo: 'Alex Nguyen',
    assignedAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
    dueDate: '2026-06-18',
    commentsCount: 4
  },
  {
    id: 't2',
    projectId: 'p1',
    projectName: 'UTT Course Planner & Scheduler',
    title: 'ER Diagram & Relational Schemas Sync',
    description: 'Sync physical index constraints on project_members relational primary keys inside the MySQL database instances.',
    priority: 'Medium',
    status: 'Backlog',
    assignedTo: 'Linh Dang',
    assignedAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    dueDate: '2026-06-25',
    commentsCount: 1
  },
  {
    id: 't3',
    projectId: 'p1',
    projectName: 'UTT Course Planner & Scheduler',
    title: 'Define Comprehensive App User Stories',
    description: 'Deconstruct guest, student, project leader, and moderator workflow actions into testable acceptance guidelines.',
    priority: 'Low',
    status: 'Done',
    assignedTo: 'Tomas Ly',
    assignedAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60',
    dueDate: '2026-06-08',
    commentsCount: 7
  },
  {
    id: 't4',
    projectId: 'p2',
    projectName: 'Smart Campus IoT Parking System',
    title: 'Microcontroller Sensor Firmware Setup',
    description: 'Debug sensor ping delays and optimize MQTT transmission logic overhead towards the cloud broker service.',
    priority: 'High',
    status: 'To Do',
    assignedTo: 'Minh Hoang',
    assignedAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    dueDate: '2026-06-20',
    commentsCount: 2
  },
  {
    id: 't5',
    projectId: 'p4',
    projectName: 'Multi-agent AI Personal Tutor Bot',
    title: 'Vector Embedding Catalog Parsing',
    description: 'Ingest PDF course notes chapters and calculate text similarities values to map precise contextual answers.',
    priority: 'High',
    status: 'Review',
    assignedTo: 'Alex Nguyen',
    assignedAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
    dueDate: '2026-06-15',
    commentsCount: 5
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post1',
    author: 'Alex Nguyen',
    role: 'Student Representative',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
    content: '🚀 Hello peers! We are kicking off Module 17 for CampusForge today. We successfully verified JWT route handlers and locked down private student portfolio routes under SQL parameter sanitization. Please check our github repo and leave feedback! Any comments are appreciated.',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&auto=format&fit=crop&q=80'
    ],
    likes: 34,
    comments: [
      { author: 'Linh Dang', content: 'Awesome! Checked the codebase and optimization looks clean. Loving the SQL parameters binding.', time: '2h ago' },
      { author: 'Minh Hoang', content: 'Design looks hyper sleek too! Looking forward to testing on my phone.', time: '1h ago' }
    ],
    topic: 'Security Systems & Web Engineering',
    createdAt: '4 hours ago'
  },
  {
    id: 'post2',
    author: 'Prof. Tran Quang',
    role: 'Senior Project Advisor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60',
    content: '📌 Reminder to all graduation candidates: Your Software Design Document proposals needs to compile with unified ER diagrams templates, clean REST endpoint routing matrices, and strict security validations. The deadline is June 28th. Good luck Teams!',
    images: [],
    likes: 112,
    comments: [
      { author: 'Phuong Mai', content: 'Thank you Professor! We will submit before next Thursday.', time: '10h ago' }
    ],
    topic: 'Official Announcements',
    createdAt: '12 hours ago'
  },
  {
    id: 'post3',
    author: 'Minh Hoang',
    role: 'UI Designer Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    content: '🎨 Fresh Figma styles designed for the TeamFlow Pro Kanban scheduler view! Opted for a "Sleek Interface" Dark Mode First strategy utilizing neon colored triggers, floating panels, soft white line frames and rich rounded details. Let me know which color accent feels best!',
    images: [
      'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=600&auto=format&fit=crop&q=80'
    ],
    likes: 56,
    comments: [],
    topic: 'Design & UX Feedback',
    createdAt: '1 day ago'
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'r1',
    title: 'Professional Software Architecture Template (docx)',
    category: 'Template',
    sharedBy: 'Prof. Tran Quang',
    downloads: 142,
    size: '1.2 MB',
    link: '#'
  },
  {
    id: 'r2',
    title: 'Express JWT validation middleware sample boilerplate',
    category: 'Source Code',
    sharedBy: 'Alex Nguyen',
    downloads: 87,
    size: '14 KB',
    link: '#'
  },
  {
    id: 'r3',
    title: 'Advanced ER Design Best Practices for Course Seeding',
    category: 'Report',
    sharedBy: 'Linh Dang',
    downloads: 104,
    size: '4.8 MB',
    link: '#'
  },
  {
    id: 'r4',
    title: 'UTT Pitch slide deck styling reference - Dark Minimalist',
    category: 'Slides',
    sharedBy: 'Minh Hoang',
    downloads: 63,
    size: '3.1 MB',
    link: '#'
  }
];

export const SKILL_EXCHANGE_DATA: SkillExchangeOffer[] = [
  {
    id: 'e1',
    studentName: 'Hoang Kim',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
    offers: ['UI/UX Design', 'Canva Layouts', 'English Tutoring'],
    requests: ['React components state', 'MySQL queries', 'NodeJS setup']
  },
  {
    id: 'e2',
    studentName: 'Bao Trung',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60',
    offers: ['NodeJS backend boilerplate', 'MySQL Database Indexes optimization'],
    requests: ['Tailwind CSS responsive design', 'Photoshop graphics']
  },
  {
    id: 'e3',
    studentName: 'Hong Hanh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    offers: ['Video Editing', 'Adobe Premiere Pro', 'PowerPoint slides design'],
    requests: ['Public Speaking', 'Git collaboration & merge strategies']
  }
];

export const REPUTATION_XP_GOAL = 5000;

export const INITIAL_LEADERBOARD = [
  { name: 'Alex Nguyen', xp: 4890, rank: 1, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60', badges: ['🔥 Top Contributor', '💻 Frontend Master'] },
  { name: 'Linh Dang', xp: 4210, rank: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60', badges: ['🛡️ Sec Specialist', '⚙️ Backend Master'] },
  { name: 'Minh Hoang', xp: 3950, rank: 3, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60', badges: ['🏆 Team Leader', '🎨 Visual Artist'] },
  { name: 'Tomas Ly', xp: 2840, rank: 4, avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60', badges: ['🌱 Quick Learner'] }
];

export const BAD_WORD_TRIGGER_LIST = ['scam', 'cheat', 'hack-admin', 'toxic', 'offensiveword'];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log1', timestamp: '2026-06-11 20:10:05', user: 'Alex Nguyen', action: 'Login Successful', module: 'Auth', ip: '192.168.1.42' },
  { id: 'log2', timestamp: '2026-06-11 20:12:30', user: 'Alex Nguyen', action: 'Updated Task status to DOING', module: 'TeamFlow Pro', ip: '192.168.1.42' },
  { id: 'log3', timestamp: '2026-06-11 20:15:11', user: 'Linh Dang', action: 'Uploaded resource: Secure JWT middleware setup', module: 'Resource Vault', ip: '192.168.1.18' },
  { id: 'log4', timestamp: '2026-06-11 20:18:04', user: 'Minh Hoang', action: 'Created project: Smart Parking IoT', module: 'Project Hub', ip: '192.168.1.75' }
];
