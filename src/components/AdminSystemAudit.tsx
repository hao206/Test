import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Check,
  EyeOff,
  FileText,
  FolderKanban,
  Lock,
  Mail,
  MessageCircle,
  Pin,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  Unlock,
  Users,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAdminStore } from '../store/useAdminStore';
import { useAuditStore } from '../store/useAuditStore';
import { usePostStore } from '../store/usePostStore';
import { useProjectStore } from '../store/useProjectStore';
import { useResourceStore } from '../store/useResourceStore';
import { NotificationAudience, Resource, Role, ReviewStatus } from '../types';
import { Translations } from '../translations';

interface AdminSystemAuditProps {
  t: Translations;
  accentColor: string;
}

type AdminTab =
  | 'dashboard'
  | 'users'
  | 'projects'
  | 'forum'
  | 'resources'
  | 'notifications'
  | 'analytics'
  | 'audit';

const adminTabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'forum', label: 'Forum', icon: MessageCircle },
  { id: 'resources', label: 'Resources', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'audit', label: 'Audit Log', icon: Search },
];

const roles: Role[] = ['Student', 'Project Leader', 'Moderator', 'Admin', 'Super Admin'];
const audiences: NotificationAudience[] = ['All', ...roles, 'Guest'];
const resourceCategories: Resource['category'][] = ['Report', 'Slides', 'Source Code', 'Template', 'Material', 'Syllabus'];

const statusClass = (status?: ReviewStatus | string) => {
  if (status === 'Approved' || status === 'Active') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (status === 'Rejected' || status === 'Locked') return 'bg-red-500/10 text-red-400 border-red-500/20';
  return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
};

const AdminButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  tone?: 'default' | 'danger' | 'success';
  title?: string;
  submit?: boolean;
}> = ({ children, onClick, tone = 'default', title, submit = false }) => {
  const toneClass =
    tone === 'danger'
      ? 'bg-red-500/15 text-red-300 hover:bg-red-500/25'
      : tone === 'success'
        ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white';

  return (
    <button
      type={submit ? 'submit' : 'button'}
      title={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-bold uppercase transition ${toneClass}`}
    >
      {children}
    </button>
  );
};

export const AdminSystemAuditModule: React.FC<AdminSystemAuditProps> = ({ t, accentColor }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [query, setQuery] = useState('');
  const [auditModule, setAuditModule] = useState('All');
  const [auditPage, setAuditPage] = useState(1);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', role: 'Student' as Role });
  const [notificationDraft, setNotificationDraft] = useState({
    title: '',
    message: '',
    channel: 'System' as 'System' | 'Email',
    audience: 'All' as NotificationAudience,
  });

  const users = useAdminStore((s) => s.users);
  const createUser = useAdminStore((s) => s.createUser);
  const deleteUser = useAdminStore((s) => s.deleteUser);
  const toggleUserLock = useAdminStore((s) => s.toggleUserLock);
  const resetUserPassword = useAdminStore((s) => s.resetUserPassword);
  const changeUserRole = useAdminStore((s) => s.changeUserRole);
  const notifications = useAdminStore((s) => s.notifications);
  const addSystemNotification = useAdminStore((s) => s.addSystemNotification);

  const projects = useProjectStore((s) => s.projects);
  const updateProjectAdminState = useProjectStore((s) => s.updateProjectAdminState);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const posts = usePostStore((s) => s.posts);
  const moderatePost = usePostStore((s) => s.moderatePost);
  const updatePostAdminState = usePostStore((s) => s.updatePostAdminState);
  const resources = useResourceStore((s) => s.resources);
  const updateResourceAdminState = useResourceStore((s) => s.updateResourceAdminState);
  const deleteResource = useResourceStore((s) => s.deleteResource);
  const auditLogs = useAuditStore((s) => s.auditLogs);
  const clearLogs = useAuditStore((s) => s.clearLogs);
  const addLog = useAuditStore((s) => s.addLog);
  const fetchUsers = useAdminStore((s) => s.fetchUsers);
  const fetchAuditLogs = useAuditStore((s) => s.fetchAuditLogs);

  React.useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, [fetchUsers, fetchAuditLogs]);

  const filteredUsers = users.filter((user) =>
    `${user.fullName} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase())
  );

  const activeUsers = users.filter((user) => user.status === 'Active').length;
  const activeProjects = projects.filter((project) => project.status === 'Active').length;
  const completedProjects = projects.filter((project) => project.status === 'Completed').length;

  const stats = [
    { label: t.totalUsers, value: users.length, detail: `${activeUsers} active`, icon: Users },
    { label: 'Active Users', value: activeUsers, detail: 'last 30 days simulated', icon: Activity },
    { label: 'Total Projects', value: projects.length, detail: `${activeProjects} active`, icon: FolderKanban },
    { label: 'Completed Projects', value: completedProjects, detail: 'portfolio-ready', icon: Check },
    { label: 'Total Resources', value: resources.length, detail: `${resources.reduce((sum, res) => sum + res.downloads, 0)} downloads`, icon: FileText },
    { label: 'Forum Posts', value: posts.length, detail: `${posts.reduce((sum, post) => sum + post.comments.length, 0)} comments`, icon: MessageCircle },
    { label: 'Audit Events', value: auditLogs.length, detail: 'persisted locally', icon: Search },
  ];

  const popularSkills = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((project) => {
      project.requiredSkills.forEach((skill) => counts.set(skill, (counts.get(skill) || 0) + 1));
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [projects]);

  const mostActiveUsers = useMemo(
    () =>
      users
        .map((user) => ({ name: user.fullName.split(' ')[0], value: user.activityHistory.length }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [users]
  );

  const userGrowth = [
    { name: 'Jan', value: 64 },
    { name: 'Feb', value: 91 },
    { name: 'Mar', value: 126 },
    { name: 'Apr', value: 158 },
    { name: 'May', value: 184 },
    { name: 'Jun', value: Math.max(184, users.length * 36) },
  ];

  const projectGrowth = [
    { name: 'Jan', value: 8 },
    { name: 'Feb', value: 15 },
    { name: 'Mar', value: 22 },
    { name: 'Apr', value: 31 },
    { name: 'May', value: 38 },
    { name: 'Jun', value: Math.max(42, projects.length * 8) },
  ];

  const filteredAuditLogs = auditLogs.filter(
    (log) =>
      (auditModule === 'All' || log.module === auditModule) &&
      `${log.user} ${log.action} ${log.module}`.toLowerCase().includes(query.toLowerCase())
  );
  const auditPageSize = 6;
  const auditPageCount = Math.max(1, Math.ceil(filteredAuditLogs.length / auditPageSize));
  const pagedAuditLogs = filteredAuditLogs.slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize);
  const modules = ['All', ...Array.from(new Set(auditLogs.map((log) => log.module)))];

  const logAdminAction = (action: string, moduleName: string) => addLog(action, moduleName, 'Campus Admin');

  const handleCreateUser = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newUser.fullName.trim() || !newUser.email.includes('@')) return;
    createUser(newUser);
    logAdminAction(`Created user ${newUser.email}`, 'User Management');
    setNewUser({ fullName: '', email: '', role: 'Student' });
  };

  const handleNotificationSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!notificationDraft.title.trim() || !notificationDraft.message.trim()) return;
    addSystemNotification(notificationDraft);
    logAdminAction(`Sent ${notificationDraft.channel} notification to ${notificationDraft.audience}`, 'Notification Center');
    setNotificationDraft({ title: '', message: '', channel: 'System', audience: 'All' });
  };

  return (
    <div className="p-1 md:p-4 space-y-6 font-sans">
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accentColor }}>
            Admin Suite
          </span>
          <h2 className="text-xl font-black text-white">CampusForge Governance Center</h2>
          <p className="text-xs text-slate-500 mt-1">Mock-admin layer with production-oriented workflows and audit visibility.</p>
        </div>
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setAuditPage(1);
            }}
            placeholder="Search users, logs, modules..."
            className="w-full rounded-xl border border-white/5 bg-[#161616] py-2.5 pl-10 pr-3 text-xs text-white outline-none focus:border-white/20"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {adminTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black uppercase transition ${
              activeTab === tab.id ? 'border-transparent text-[#0A0A0A]' : 'border-white/5 bg-[#111111] text-slate-500 hover:text-white'
            }`}
            style={activeTab === tab.id ? { backgroundColor: accentColor } : {}}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/5 bg-[#111111] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</span>
                  <stat.icon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="mt-4 text-3xl font-black text-white">{stat.value}</div>
                <p className="mt-1 text-[10px] text-slate-500">{stat.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartPanel title="User Growth" data={userGrowth} accentColor={accentColor} type="line" />
            <ChartPanel title="Project Growth" data={projectGrowth} accentColor="#00E5FF" type="bar" />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <form onSubmit={handleCreateUser} className="xl:col-span-4 rounded-2xl border border-white/5 bg-[#111111] p-5 space-y-3">
            <h3 className="text-sm font-black text-white">CRUD User</h3>
            <input value={newUser.fullName} onChange={(e) => setNewUser((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Full name" className="w-full rounded-xl border border-white/5 bg-[#161616] p-3 text-xs text-white outline-none" />
            <input value={newUser.email} onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))} placeholder="email@st.utt.edu.vn" className="w-full rounded-xl border border-white/5 bg-[#161616] p-3 text-xs text-white outline-none" />
            <select value={newUser.role} onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value as Role }))} className="w-full rounded-xl border border-white/5 bg-[#161616] p-3 text-xs text-white outline-none">
              {roles.map((role) => <option key={role}>{role}</option>)}
            </select>
            <AdminButton tone="success" submit>Create User</AdminButton>
          </form>

          <div className="xl:col-span-8 rounded-2xl border border-white/5 bg-[#111111] p-5 space-y-3">
            <h3 className="text-sm font-black text-white">User Management</h3>
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div key={user.id} className="rounded-xl border border-white/5 bg-[#0A0A0A] p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-sm">{user.fullName}</div>
                      <div className="text-[10px] text-slate-500">{user.email} - last active {user.lastActiveAt}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-lg border px-2 py-1 text-[9px] font-bold ${statusClass(user.status)}`}>{user.status}</span>
                      <select value={user.role} onChange={(e) => { changeUserRole(user.id, e.target.value as Role); logAdminAction(`Changed role for ${user.email}`, 'Role Management'); }} className="rounded-lg border border-white/5 bg-[#161616] px-2 py-2 text-[10px] text-white">
                        {roles.map((role) => <option key={role}>{role}</option>)}
                      </select>
                      <AdminButton onClick={() => { toggleUserLock(user.id); logAdminAction(`Toggled lock for ${user.email}`, 'User Management'); }}>{user.status === 'Active' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />} {user.status === 'Active' ? 'Lock' : 'Unlock'}</AdminButton>
                      <AdminButton onClick={() => { resetUserPassword(user.id); logAdminAction(`Reset password for ${user.email}`, 'User Management'); }}><RotateCcw className="h-3 w-3" /> Reset</AdminButton>
                      <AdminButton tone="danger" onClick={() => { deleteUser(user.id); logAdminAction(`Deleted user ${user.email}`, 'User Management'); }}><Trash2 className="h-3 w-3" /> Delete</AdminButton>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {user.activityHistory.map((item) => <span key={item} className="rounded-md bg-white/5 px-2 py-1 text-[9px] text-slate-400">{item}</span>)}
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && <EmptyState label="No users match the current filter." />}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <ListPanel title="Project Management">
          {projects.map((project) => (
            <div key={project.id} className="rounded-xl border border-white/5 bg-[#0A0A0A] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2 items-center">
                  <h3 className="text-sm font-bold text-white">{project.name}</h3>
                  {project.featured && <span className="rounded-md bg-yellow-500/10 px-2 py-1 text-[9px] text-yellow-300">Featured</span>}
                  {project.hidden && <span className="rounded-md bg-slate-500/10 px-2 py-1 text-[9px] text-slate-300">Hidden</span>}
                </div>
                <p className="text-[10px] text-slate-500">{project.status} - {project.category} - leader {project.leaderName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AdminButton tone="success" onClick={() => { updateProjectAdminState(project.id, { reviewStatus: 'Approved' }); logAdminAction(`Approved project ${project.id}`, 'Project Management'); }}><Check className="h-3 w-3" /> Approve</AdminButton>
                <AdminButton tone="danger" onClick={() => { updateProjectAdminState(project.id, { reviewStatus: 'Rejected' }); logAdminAction(`Rejected project ${project.id}`, 'Project Management'); }}><X className="h-3 w-3" /> Reject</AdminButton>
                <AdminButton onClick={() => updateProjectAdminState(project.id, { hidden: !project.hidden })}><EyeOff className="h-3 w-3" /> Hide</AdminButton>
                <AdminButton onClick={() => updateProjectAdminState(project.id, { featured: !project.featured })}><Star className="h-3 w-3" /> Feature</AdminButton>
                <AdminButton tone="danger" onClick={() => { deleteProject(project.id); logAdminAction(`Deleted project ${project.id}`, 'Project Management'); }}><Trash2 className="h-3 w-3" /> Delete</AdminButton>
              </div>
            </div>
          ))}
        </ListPanel>
      )}

      {activeTab === 'forum' && (
        <ListPanel title="Forum Management">
          {posts.map((post) => (
            <div key={post.id} className="rounded-xl border border-white/5 bg-[#0A0A0A] p-4 flex flex-col gap-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{post.author} - {post.topic}</h3>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{post.content}</p>
                  <p className="text-[10px] text-slate-600">{post.comments.length} comments</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton onClick={() => updatePostAdminState(post.id, { pinned: !post.pinned })}><Pin className="h-3 w-3" /> Pin</AdminButton>
                  <AdminButton onClick={() => updatePostAdminState(post.id, { locked: !post.locked })}><Lock className="h-3 w-3" /> Lock</AdminButton>
                  <AdminButton onClick={() => updatePostAdminState(post.id, { hidden: !post.hidden })}><EyeOff className="h-3 w-3" /> Hide</AdminButton>
                  <AdminButton tone="success" onClick={() => { updatePostAdminState(post.id, { moderationStatus: 'Approved' }); logAdminAction(`Approved comments on ${post.id}`, 'Forum Management'); }}>Approve Comments</AdminButton>
                  <AdminButton tone="danger" onClick={() => { moderatePost(post.id, 'Reject'); logAdminAction(`Deleted post ${post.id}`, 'Forum Management'); }}><Trash2 className="h-3 w-3" /> Delete</AdminButton>
                </div>
              </div>
            </div>
          ))}
        </ListPanel>
      )}

      {activeTab === 'resources' && (
        <ListPanel title="Resource Management">
          {resources.map((resource) => (
            <div key={resource.id} className="rounded-xl border border-white/5 bg-[#0A0A0A] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">{resource.title}</h3>
                <p className="text-[10px] text-slate-500">{resource.category} - {resource.downloads} downloads - shared by {resource.sharedBy}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={resource.category} onChange={(e) => updateResourceAdminState(resource.id, { category: e.target.value as Resource['category'] })} className="rounded-lg border border-white/5 bg-[#161616] px-2 py-2 text-[10px] text-white">
                  {resourceCategories.map((category) => <option key={category}>{category}</option>)}
                </select>
                <AdminButton tone="success" onClick={() => { updateResourceAdminState(resource.id, { reviewStatus: 'Approved' }); logAdminAction(`Approved resource ${resource.id}`, 'Resource Management'); }}>Approve</AdminButton>
                <AdminButton tone="danger" onClick={() => { updateResourceAdminState(resource.id, { reviewStatus: 'Rejected' }); logAdminAction(`Rejected resource ${resource.id}`, 'Resource Management'); }}>Reject</AdminButton>
                <AdminButton tone="danger" onClick={() => { deleteResource(resource.id); logAdminAction(`Deleted resource ${resource.id}`, 'Resource Management'); }}><Trash2 className="h-3 w-3" /> Delete</AdminButton>
              </div>
            </div>
          ))}
        </ListPanel>
      )}

      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <form onSubmit={handleNotificationSubmit} className="xl:col-span-4 rounded-2xl border border-white/5 bg-[#111111] p-5 space-y-3">
            <h3 className="text-sm font-black text-white">Notification Center</h3>
            <input value={notificationDraft.title} onChange={(e) => setNotificationDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="Notification title" className="w-full rounded-xl border border-white/5 bg-[#161616] p-3 text-xs text-white outline-none" />
            <textarea value={notificationDraft.message} onChange={(e) => setNotificationDraft((prev) => ({ ...prev, message: e.target.value }))} placeholder="Message" rows={4} className="w-full rounded-xl border border-white/5 bg-[#161616] p-3 text-xs text-white outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <select value={notificationDraft.channel} onChange={(e) => setNotificationDraft((prev) => ({ ...prev, channel: e.target.value as 'System' | 'Email' }))} className="rounded-xl border border-white/5 bg-[#161616] p-3 text-xs text-white outline-none">
                <option>System</option>
                <option>Email</option>
              </select>
              <select value={notificationDraft.audience} onChange={(e) => setNotificationDraft((prev) => ({ ...prev, audience: e.target.value as NotificationAudience }))} className="rounded-xl border border-white/5 bg-[#161616] p-3 text-xs text-white outline-none">
                {audiences.map((audience) => <option key={audience}>{audience}</option>)}
              </select>
            </div>
            <AdminButton tone="success" submit><Mail className="h-3 w-3" /> Send Notification</AdminButton>
          </form>
          <ListPanel className="xl:col-span-8" title="Sent Notifications">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-xl border border-white/5 bg-[#0A0A0A] p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">{notification.title}</h3>
                  <span className="rounded-lg bg-white/5 px-2 py-1 text-[9px] text-slate-400">{notification.channel} - {notification.audience}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{notification.message}</p>
                <p className="mt-2 text-[10px] text-slate-600">{notification.createdAt}</p>
              </div>
            ))}
          </ListPanel>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartPanel title="Most Popular Skills" data={popularSkills} accentColor={accentColor} type="bar" />
          <ChartPanel title="Most Active Users" data={mostActiveUsers} accentColor="#FF007F" type="bar" />
          <ChartPanel title="User Growth" data={userGrowth} accentColor="#00E5FF" type="line" />
          <ChartPanel title="Project Growth" data={projectGrowth} accentColor="#BD00FF" type="line" />
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-white/5 bg-[#111111] p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h3 className="text-sm font-black text-white">Audit Log</h3>
            <div className="flex flex-wrap gap-2">
              <select value={auditModule} onChange={(e) => { setAuditModule(e.target.value); setAuditPage(1); }} className="rounded-lg border border-white/5 bg-[#161616] px-3 py-2 text-[10px] text-white">
                {modules.map((moduleName) => <option key={moduleName}>{moduleName}</option>)}
              </select>
              <AdminButton tone="danger" onClick={clearLogs}>Clear Logs</AdminButton>
            </div>
          </div>
          <div className="space-y-2">
            {pagedAuditLogs.map((log) => (
              <div key={log.id} className="rounded-xl border border-white/5 bg-black p-3 font-mono text-[10px] text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span><span className="text-slate-600">[{log.timestamp}]</span> <span style={{ color: accentColor }}>[{log.module}]</span> {log.user}: {log.action}</span>
                <span className="text-slate-600">IP {log.ip}</span>
              </div>
            ))}
            {pagedAuditLogs.length === 0 && <EmptyState label="No audit entries for this filter." />}
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-slate-500">
            <span>Page {auditPage} / {auditPageCount}</span>
            <div className="flex gap-2">
              <AdminButton onClick={() => setAuditPage((page) => Math.max(1, page - 1))}>Prev</AdminButton>
              <AdminButton onClick={() => setAuditPage((page) => Math.min(auditPageCount, page + 1))}>Next</AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ListPanel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <div className={`rounded-2xl border border-white/5 bg-[#111111] p-5 space-y-3 ${className}`}>
    <h3 className="text-sm font-black text-white">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-xs text-slate-500">{label}</div>
);

const ChartPanel: React.FC<{
  title: string;
  data: { name: string; value: number }[];
  accentColor: string;
  type: 'line' | 'bar';
}> = ({ title, data, accentColor, type }) => (
  <div className="rounded-2xl border border-white/5 bg-[#111111] p-5 space-y-4">
    <h3 className="text-sm font-black text-white">{title}</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" fontSize={10} stroke="#64748b" tickLine={false} />
            <YAxis fontSize={10} stroke="#64748b" tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
            <Line type="monotone" dataKey="value" stroke={accentColor} strokeWidth={2.5} dot={false} />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" fontSize={10} stroke="#64748b" tickLine={false} />
            <YAxis fontSize={10} stroke="#64748b" tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
            <Bar dataKey="value" fill={accentColor} radius={[6, 6, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  </div>
);
