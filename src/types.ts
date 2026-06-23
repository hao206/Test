export type Role = 'Guest' | 'Student' | 'Project Leader' | 'Moderator' | 'Admin' | 'Super Admin';
export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';
export type NotificationAudience = Role | 'All';

export interface UserProfile {
  id: string;
  fullName: string;
  studentId: string;
  email: string;
  avatar: string;
  coverPhoto: string;
  faculty: string;
  major: string;
  academicYear: string;
  biography: string;
  skills: { name: string; level: number }[];
  interests: string[];
  careerGoals: string;
  reputationScore: number;
  github?: string;
  linkedin?: string;
  completedProjects?: { id: string; name: string; role: string; completedAt?: string }[];
  role: Role;
  locked?: boolean;
  lastActiveAt?: string;
}

export type ProjectStatus = 'Recruiting' | 'Active' | 'Completed' | 'Archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredSkills: string[];
  deadline: string;
  teamSize: number;
  progress: number;
  status: ProjectStatus;
  leaderId: string;
  leaderName: string;
  members: string[];
  visibility?: 'Public' | 'Private';
  reviewStatus?: ReviewStatus;
  hidden?: boolean;
  featured?: boolean;
}

export type TaskStatus = 'Backlog' | 'To Do' | 'Doing' | 'Review' | 'Done';

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: TaskStatus;
  assignedTo: string;
  assignedAvatar?: string;
  dueDate: string;
  commentsCount: number;
}

export interface Post {
  id: string;
  author: string;
  role: string;
  avatar: string;
  content: string;
  images: string[];
  likes: number;
  comments: { author: string; content: string; time: string }[];
  loved?: boolean;
  topic: string;
  saved?: boolean;
  createdAt: string;
  pinned?: boolean;
  locked?: boolean;
  hidden?: boolean;
  moderationStatus?: ReviewStatus;
}

export interface Resource {
  id: string;
  title: string;
  category: 'Report' | 'Slides' | 'Source Code' | 'Template' | 'Material' | 'Syllabus';
  sharedBy: string;
  downloads: number;
  size: string;
  link: string;
  reviewStatus?: ReviewStatus;
}

export interface SkillExchangeOffer {
  id: string;
  studentName: string;
  avatar: string;
  offers: string[];
  requests: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  ip: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: 'Active' | 'Locked';
  lastActiveAt: string;
  activityHistory: string[];
}

export interface SystemNotification {
  id: string;
  title: string;
  channel: 'System' | 'Email';
  audience: NotificationAudience;
  message: string;
  createdAt: string;
}
