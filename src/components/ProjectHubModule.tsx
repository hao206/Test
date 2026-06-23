import React, { useState, useEffect } from 'react';
import { Search, FolderPlus, Loader2, Star, Calendar, Users, CheckCircle, Check, X } from 'lucide-react';
import { Project } from '../types';
import api from '../lib/api';
import { translations } from '../translations';

// Zustand stores
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectStore } from '../store/useProjectStore';
import { useAuditStore } from '../store/useAuditStore';
import { useToastStore } from '../store/useToastStore';
import { useNotificationStore } from '../store/useNotificationStore';

interface ProjectHubProps {
  currentUserRole?: string;
}

export const ProjectHubModule: React.FC<ProjectHubProps> = ({
  currentUserRole
}) => {
  const { lang, accent: accentColor } = useUIStore();
  const t = translations[lang];

  const user = useAuthStore((s) => s.user);
  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const applyProject = useProjectStore((s) => s.applyToProject);
  const finalizeTeam = useProjectStore((s) => s.finalizeTeam);

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(() => {
      fetchProjects();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const addLog = useAuditStore((s) => s.addLog);
  const addToast = useToastStore((s) => s.addToast);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addReputation = useAuthStore((s) => s.addReputation);

  const activeUserRole = currentUserRole || user?.role || 'Student';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGuestBlockModal, setShowGuestBlockModal] = useState(false);
  
  // Create Project states
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCategory, setProjCategory] = useState('Web Application');
  const [projSkills, setProjSkills] = useState('React, NodeJS');
  const [projDeadline, setProjDeadline] = useState('2026-08-30');
  const [projTeamSize, setProjTeamSize] = useState(4);
  const [projVisibility, setProjVisibility] = useState<'Public' | 'Private'>('Public');
  const [applyStates, setApplyStates] = useState<Record<string, 'idle' | 'applying' | 'done'>>({});
  const [applyRemark, setApplyRemark] = useState('');
  const [pendingApplyProjId, setPendingApplyProjId] = useState<string | null>(null);

  const [showManageModal, setShowManageModal] = useState(false);
  const [manageProjId, setManageProjId] = useState<string | null>(null);
  const [manageApplications, setManageApplications] = useState<any[]>([]);

  const categories = ['All', 'Web Application', 'IoT & Hardware', 'Blockchain', 'Artificial Intelligence', 'Mobile Application'];
  const statuses = ['All', 'Recruiting', 'Active', 'Completed', 'Archived'];

  // Match Calculation matching logic
  const getMatchScore = (project: Project) => {
    if (!user) return 0;
    const userSkillNames = user.skills.map(s => s.name.toLowerCase());
    const matchedSkills = project.requiredSkills.filter(skill => 
      userSkillNames.includes(skill.toLowerCase())
    );
    return Math.round((matchedSkills.length / Math.max(1, project.requiredSkills.length)) * 100);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUserRole === 'Guest') {
      setShowGuestBlockModal(true);
      return;
    }
    if (!projName || !projDesc) return;

    if (projName.length < 5) {
      addToast(
        lang === 'en' ? 'Project name must be at least 5 characters long.' : 'Tên đề tài phải có ít nhất 5 ký tự.',
        'error'
      );
      return;
    }

    const parsedSkills = projSkills.split(',').map((s: string) => s.trim()).filter(Boolean);
    try {
      await createProject({
        name: projName,
        description: projDesc,
        category: projCategory,
        requiredSkills: parsedSkills,
        deadline: projDeadline,
        teamSize: Number(projTeamSize),
        status: 'Recruiting',
        visibility: projVisibility,
      } as any);
      addLog(`Created new study project proposal: ${projName}`, 'Project Hub', user?.fullName || 'Academic Peer');
      addToast(lang === 'en' ? `Project created! Awaiting admin review.` : `Tạo dự án thành công! Đang chờ admin duyệt.`, 'success');
      setShowCreateModal(false);
      setProjName(''); setProjDesc(''); setProjSkills('React, NodeJS');
    } catch (err: any) {
      addToast(err.message || 'Tạo dự án thất bại.', 'error');
    }
  };

  const handleApplyClick = (projId: string) => {
    if (activeUserRole === 'Guest') {
      setShowGuestBlockModal(true);
      return;
    }
    setPendingApplyProjId(projId);
    setApplyRemark('Hi, I am highly interested in contributing to this academic workspace!');
  };

  const confirmApplication = async (projId: string) => {
    setApplyStates(prev => ({ ...prev, [projId]: 'applying' }));
    try {
      await applyProject(projId, applyRemark);
      setApplyStates(prev => ({ ...prev, [projId]: 'done' }));
      setPendingApplyProjId(null);
      addLog(`Applied to project: ${projId}`, 'Project Hub', user?.fullName || '');
      addToast(lang === 'en' ? 'Application submitted!' : 'Đơn ứng tuyển đã được gửi!', 'success');
      const matchedProj = projects.find(p => p.id === projId);
      if (matchedProj) {
        addNotification(
          lang === 'en' ? 'Application Sent' : 'Đơn ứng tuyển đã gửi',
          `Đơn ứng tuyển vào "${matchedProj.name}" đã được gửi thành công.`,
          'apply'
        );
      }
    } catch (err: any) {
      addToast(err.message || 'Gửi đơn thất bại.', 'error');
      setApplyStates(prev => ({ ...prev, [projId]: 'idle' }));
    }
  };

  const openManageApplications = async (projId: string) => {
    setManageProjId(projId);
    setShowManageModal(true);
    setManageApplications([]);
    try {
      const res = await api.get(`/projects/${projId}/applications`);
      setManageApplications(res);
    } catch (err: any) {
      addToast('Lỗi tải danh sách đơn', 'error');
    }
  };

  const handleApproveApplication = async (appId: string, action: 'approve' | 'reject') => {
    try {
      await api.put(`/projects/${manageProjId}/applications/${appId}`, { action });
      addToast('Đã xử lý đơn thành công', 'success');
      setManageApplications(prev => prev.map(a => a.id === appId ? { ...a, status: action === 'approve' ? 'Approved' : 'Rejected' } : a));
    } catch (err: any) {
      addToast('Lỗi xử lý đơn', 'error');
    }
  };

  const filteredProjects = projects.filter(p => {
    if (p.visibility === 'Private') {
      const isMember = user && (p.leaderId === user.id || p.members?.includes(user.id));
      const isAdmin = activeUserRole === 'Admin' || activeUserRole === 'Super Admin';
      if (!isMember && !isAdmin) return false;
    }
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-1 md:p-4 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span 
              className="px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-widest"
              style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}30`, color: accentColor }}
            >
              MODULE 04 & 05
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight font-display">{t.appName} {t.projectHub}</h2>
            <p className="text-slate-400 text-sm max-w-xl">
              {t.phSubTitle}
            </p>
          </div>
          <button
            onClick={() => {
              if (activeUserRole === 'Guest') {
                setShowGuestBlockModal(true);
              } else {
                setShowCreateModal(true);
              }
            }}
            className="px-5 py-3 rounded-full text-black font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:shadow-xl self-start md:self-center cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            <FolderPlus className="w-4 h-4" />
            {t.createProject}
          </button>
        </div>
        <div className="absolute right-0 bottom-0 w-48 h-48 blur-[80px] opacity-20 rounded-full" style={{ backgroundColor: accentColor }}></div>
      </div>

      {/* Recommended Projects (AI matchmaking indicators) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#CCFF00]">{t.phTopMatches}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.filter(p => getMatchScore(p) > 30 && p.status === 'Recruiting').slice(0, 2).map(p => {
            const fitRate = getMatchScore(p);
            return (
              <div key={`match-${p.id}`} className="bg-[#111111]/90 border border-[#CCFF00]/25 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-yellow-500 font-bold tracking-tight bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase">
                      {fitRate}% {t.phMatchScore}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{p.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.requiredSkills.map(s => (
                      <span key={s} className="text-[9px] text-[#CCFF00] font-bold font-mono px-1.5 bg-[#CCFF00]/10 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleApplyClick(p.id)}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-lg shrink-0 transition-colors cursor-pointer"
                >
                  {t.btnApply.split(" ")[0]}
                </button>
              </div>
            );
          })}
          {projects.filter(p => getMatchScore(p) > 30 && p.status === 'Recruiting').length === 0 && (
            <div className="col-span-2 bg-[#111111] border border-white/5 rounded-2xl p-4 text-center text-xs text-slate-500">
              No recommended projects with qualifying parameters in current index. Bổ sung kỹ năng học thuật để mở rộng gợi ý!
            </div>
          )}
        </div>
      </div>

      {/* Filtration Tools and Search Interface */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-[#0C0C0C] p-4 border border-white/5 rounded-2xl">
        <div className="relative flex-1 font-sans">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161616] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm font-sans focus:outline-none focus:border-white/20 text-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#161616] border border-white/5 text-xs text-slate-300 rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#161616] border border-white/5 text-xs text-slate-300 rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Grid List of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        {filteredProjects.map(p => {
          const matchPercent = getMatchScore(p);
          return (
            <div 
              key={p.id} 
              className="bg-[#111111] border border-white/5 rounded-[24px] p-6 hover:shadow-2xl transition-all duration-300 hover:border-white/10 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Card visual elements */}
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold font-mono tracking-wide uppercase bg-white/5 px-2.5 py-1 rounded-full">{p.category}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    p.status === 'Recruiting' ? 'bg-[#CCFF00]/10 text-[#CCFF00]' :
                    p.status === 'Active' ? 'bg-blue-500/10 text-blue-400' :
                    p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base leading-tight group-hover:text-[#CCFF00] transition-colors">{p.name}</h3>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Leader: <span className="text-white hover:underline cursor-pointer font-medium">{p.leaderName}</span>
                  </div>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {p.description}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1">
                  {p.requiredSkills.map(s => (
                    <span key={s} className="text-[9px] font-mono font-bold bg-[#181818] text-slate-300 border border-white/5 px-2 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress and lower deck */}
              <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Progress Tracker</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${p.progress}%`,
                        backgroundColor: p.status === 'Completed' ? '#10b981' : accentColor
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Target: {p.teamSize}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Due: {p.deadline}</span>
                  </div>
                </div>

                {p.status === 'Recruiting' && (
                  <div className="pt-2">
                    {p.leaderId === user?.id ? (
                      <button
                        onClick={() => openManageApplications(p.id)}
                        className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        {lang === 'en' ? 'Manage Applications' : 'Quản lý đơn xin vào'}
                      </button>
                    ) : p.myApplication || applyStates[p.id] === 'done' ? (
                      <div className="w-full text-center py-2 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl font-bold flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> 
                        {p.myApplication?.status === 'Approved' ? 'Đã duyệt' : (p.myApplication?.status === 'Rejected' ? 'Từ chối' : t.btnDone)}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyClick(p.id)}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        {t.btnApply} ({matchPercent}% fit)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply Modal */}
      {pendingApplyProjId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-[28px] p-6 space-y-4">
            <h3 className="text-lg font-black text-white font-display">{t.applyModalTitle}</h3>
            <p className="text-xs text-slate-400">
              {t.applyRemarkLabel}
            </p>
            <textarea
              value={applyRemark}
              onChange={(e) => setApplyRemark(e.target.value)}
              rows={4}
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
              placeholder="Explain references, syllabus details, or student credentials..."
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingApplyProjId(null)}
                className="px-4 py-2 bg-white/5 text-slate-300 text-xs font-bold rounded-xl hover:bg-white/10 cursor-pointer"
              >
                {t.btnCancel}
              </button>
              <button
                type="button"
                onClick={() => confirmApplication(pendingApplyProjId)}
                className="px-5 py-2 text-black text-xs font-black uppercase rounded-xl cursor-pointer flex items-center gap-2"
                style={{ backgroundColor: accentColor }}
              >
                {applyStates[pendingApplyProjId] === 'applying' && <Loader2 className="w-3.5 h-3.5 animate-spin w-4 h-4" />}
                {t.btnSubmit}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-lg bg-[#111111] border border-white/10 rounded-[32px] p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white font-display">{t.createProjModalTitle}</h3>
              <p className="text-xs text-slate-500">
                Register clean specifications in compliance with general graduation guidelines.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.projNameLabel}</label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="e.g. JWT-secure Multi-agent Framework"
                  className="w-full bg-[#161616] border border-white/5 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.projDescLabel}</label>
                <textarea
                  required
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows={3}
                  placeholder="Explain system architecture, target users, and technology challenges..."
                  className="w-full bg-[#161616] border border-white/5 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.projCatLabel}</label>
                  <select
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-white/20 transition-all cursor-pointer"
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.projDeadlineLabel}</label>
                  <input
                    type="date"
                    required
                    value={projDeadline}
                    onChange={(e) => setProjDeadline(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-white/20 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.projSkillsLabel}</label>
                  <input
                    type="text"
                    required
                    value={projSkills}
                    onChange={(e) => setProjSkills(e.target.value)}
                    placeholder="Python, React, MySQL"
                    className="w-full bg-[#161616] border border-white/5 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-white/20 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.projTeamSizeLabel}</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    required
                    value={projTeamSize}
                    onChange={(e) => setProjTeamSize(Number(e.target.value))}
                    className="w-full bg-[#161616] border border-white/5 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{lang === 'en' ? 'Visibility' : 'Quyền riêng tư'}</label>
                <select
                  value={projVisibility}
                  onChange={(e) => setProjVisibility(e.target.value as any)}
                  className="w-full bg-[#161616] border border-white/5 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-white/20 transition-all cursor-pointer"
                >
                  <option value="Public">{lang === 'en' ? 'Public (Discoverable)' : 'Công khai'}</option>
                  <option value="Private">{lang === 'en' ? 'Private (Invite-only)' : 'Riêng tư'}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 font-sans">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 bg-white/5 text-slate-300 text-xs font-bold rounded-xl hover:bg-white/10 cursor-pointer"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-black text-xs font-black uppercase rounded-xl cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                >
                  {t.btnSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest Mode Restriction Popup Modal Interceptor */}
      {showGuestBlockModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#111111] border border-yellow-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-yellow-400">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-black font-display uppercase">{t.guestReqTitle}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.guestDescRestricted}
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setShowGuestBlockModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 transition text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                {t.backToGuestBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Applications Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-2xl bg-[#111111] border border-white/10 rounded-[28px] p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-lg font-black text-white font-display">
                {lang === 'en' ? 'Manage Applications' : 'Quản lý đơn xin gia nhập'}
              </h3>
              <button onClick={() => setShowManageModal(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {manageApplications.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-10 font-mono">
                  {lang === 'en' ? 'No applications yet.' : 'Chưa có đơn xin gia nhập nào.'}
                </div>
              ) : (
                manageApplications.map(app => (
                  <div key={app.id} className="bg-[#161616] border border-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <img src={app.applicant.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="avatar"/>
                        <div>
                          <h4 className="font-bold text-white text-sm">{app.applicant.fullName}</h4>
                          <span className="text-[10px] text-slate-400 font-mono block">{app.applicant.studentId} • {app.applicant.major}</span>
                          <span className="text-[10px] text-[#CCFF00] font-bold">XP: {app.applicant.reputationScore} • Độ phù hợp: {app.applicant.matchScore}%</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                        app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        app.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 bg-black/40 p-3 rounded-lg leading-relaxed line-clamp-3 italic">
                      "{app.remark}"
                    </p>
                    {app.status === 'Pending' && (
                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          onClick={() => handleApproveApplication(app.id, 'reject')}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Từ chối
                        </button>
                        <button 
                          onClick={() => handleApproveApplication(app.id, 'approve')}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Chấp nhận
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
