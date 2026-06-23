import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectStore } from '../store/useProjectStore';
import { useTaskStore } from '../store/useTaskStore';
import { translations } from '../translations';
import { INITIAL_LEADERBOARD } from '../data';



import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { lang, accent } = useUIStore();
  const t = translations[lang];

  const user = useAuthStore((s) => s.user);
  const projects = useProjectStore((s) => s.projects);
  const tasks = useTaskStore((s) => s.tasks);
  const fetchLeaderboard = useAuthStore((s) => s.fetchLeaderboard);

  const [widgetTaskFilter, setWidgetTaskFilter] = useState<'All' | 'High'>('All');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    useProjectStore.getState().fetchProjects();
    useTaskStore.getState().fetchTasks(''); // fetches all tasks if supported, or at least initializes
    fetchLeaderboard().then(data => setLeaderboard(data));
  }, []);

  // Filter tasks assigned to current user
  const userFilteredTasks = tasks.filter(task => {
    const isMe = user && task.assignedTo === user.fullName;
    if (!isMe) return false;
    if (widgetTaskFilter === 'High') return task.priority === 'High';
    return true;
  });

  // Calculate dynamic Sprint completion stats
  const completedTasks = tasks.filter(t => t.status === 'Done').length;

  // Empty State for users with NO active projects
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] font-sans">
        <div className="bg-surface border border-border-dim rounded-[32px] p-10 max-w-xl w-full text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-blue-500" />
          
          <div className="w-20 h-20 bg-background rounded-full border border-border-dim mx-auto flex items-center justify-center mb-6 shadow-sm">
            <span className="text-4xl">🚀</span>
          </div>
          
          <h1 className="text-3xl font-black text-text-primary tracking-tight font-display">
            {lang === 'en' ? 'Welcome to CampusForge!' : 'Chào mừng đến với CampusForge!'}
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            {lang === 'en' 
              ? "You haven't joined any projects yet. Start your journey by discovering ideas or building your own team."
              : "Bạn chưa tham gia dự án nào. Hãy bắt đầu hành trình bằng cách khám phá các ý tưởng hoặc tự xây dựng đội ngũ của riêng mình."}
          </p>
          
          <div className="pt-4">
            <Button size="lg" onClick={() => navigate('/projects')} className="w-full sm:w-auto shadow-lg shadow-accent-primary/20 hover:scale-105 transition-transform">
              {lang === 'en' ? 'Explore Projects' : 'Khám phá Dự án'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans animate-fade-in">
      
      {/* Visual Sprint Intro Banner */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-surface border border-border-dim rounded-[32px] p-6 lg:p-8 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <Badge variant="info">{lang === 'en' ? 'My Workspace' : 'Không gian làm việc'}</Badge>
            <h1 className="text-3xl lg:text-4xl font-black text-text-primary mt-4 font-display tracking-tight leading-tight">
              {lang === 'en' ? 'Welcome back,' : 'Chào mừng,'} {(user?.fullName || 'Guest').split(' ')[0]}
            </h1>
            <p className="text-text-secondary text-xs leading-relaxed max-w-lg">
              {lang === 'en' ? "Here's an overview of your active tasks and ongoing projects." : "Đây là tổng quan về công việc hiện tại và các dự án bạn đang tham gia."}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-border-dim">
              <Button onClick={() => navigate('/teamflow')}>
                {lang === 'en' ? 'Open Kanban Board' : 'Mở bảng Công việc'}
              </Button>
            </div>
          </div>
          {/* Ambient layout graphic blobs */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 blur-[90px] opacity-20 rounded-full bg-accent-primary" />
        </div>

        {/* Secondary widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Widget 1: Personal checklist */}
          <div className="bg-surface border border-border-dim rounded-[24px] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-text-primary text-sm">{lang === 'en' ? 'My Tasks' : 'Việc của tôi'}</h3>
              <div className="flex gap-2">
                {(['All', 'High'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setWidgetTaskFilter(f)}
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      widgetTaskFilter === f ? 'bg-border-active text-text-primary' : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {userFilteredTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => navigate('/teamflow')}
                  className="p-3 bg-surface-hover border border-border-dim rounded-xl flex items-center justify-between hover:border-border-active transition cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-text-primary">{task.title}</div>
                    <span className="text-[9px] text-text-muted font-mono block">{lang === 'en' ? 'Due:' : 'Hạn chót:'} {task.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-[8px] bg-background border-border-dim">{task.status}</Badge>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                        task.priority === 'High' ? 'bg-red-500' : 'bg-yellow-400'
                    }`} />
                  </div>
                </div>
              ))}

              {userFilteredTasks.length === 0 && (
                <div className="text-center text-xs text-text-muted py-6 font-mono border border-dashed border-border-dim rounded-xl">
                  {lang === 'en' ? 'No pending tasks.' : 'Không có công việc tồn đọng.'}
                </div>
              )}
            </div>
          </div>

          {/* Widget 2: Active Projects */}
          <div className="bg-surface border border-border-dim rounded-[24px] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-text-primary text-sm">{lang === 'en' ? 'Active Projects' : 'Dự án đang chạy'}</h3>
              <span onClick={() => navigate('/projects')} className="text-[10px] text-text-secondary cursor-pointer hover:underline font-mono">{lang === 'en' ? 'View all' : 'Xem tất cả'} →</span>
            </div>

            <div className="space-y-3">
              {projects.filter(p => p.status === 'Active').map((p) => (
                <div key={p.id} className="flex gap-3 items-center p-2 rounded-xl hover:bg-surface-hover transition cursor-pointer" onClick={() => navigate('/projects')}>
                  <div className="w-10 h-10 rounded-xl bg-background border border-border-dim shrink-0 flex items-center justify-center text-lg shadow-sm">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-text-primary truncate">{p.name}</h4>
                    <p className="text-[9px] text-text-muted truncate">{p.category} • {p.members.length} {lang === 'en' ? 'members' : 'thành viên'}</p>
                  </div>
                </div>
              ))}
              
              {projects.filter(p => p.status === 'Active').length === 0 && (
                 <div className="text-center text-xs text-text-muted py-6 font-mono">
                  {lang === 'en' ? 'No active projects.' : 'Không có dự án đang chạy.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right col: Profile summary radar & Achievements widgets */}
      <div className="lg:col-span-4 space-y-6">
        {user ? (
          <div className="bg-surface border border-border-dim rounded-[24px] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4 text-center pb-4 border-b border-border-dim">
              <div className="relative inline-block cursor-pointer" onClick={() => navigate('/profile/me')}>
                <Avatar src={user.avatar} size="lg" className="w-16 h-16 mx-auto border-border-active" />
                <div className="w-4.5 h-4.5 bg-green-500 rounded-full border-2 border-surface absolute bottom-0 right-0" />
              </div>
              <div>
                <h3 className="text-sm font-black text-text-primary tracking-wide hover:text-accent-primary cursor-pointer transition-colors" onClick={() => navigate('/profile/me')}>
                  {user.fullName}
                </h3>
                <p className="text-[10px] text-text-muted font-medium mt-1">{user.studentId} • {user.role === 'Guest' ? t.userRoleGuest : user.role === 'Admin' ? 'Administrator' : 'CS Sophomore'}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
               <span className="text-text-secondary">{lang === 'en' ? 'Reputation XP' : 'Điểm Uy tín'}</span>
               <span className="font-bold text-accent-primary">{user.reputationScore} XP</span>
            </div>

            <Button variant="secondary" onClick={() => navigate('/settings')} className="w-full">
              {t.upgradeProfile}
            </Button>
          </div>
        ) : (
          <div className="bg-surface border border-border-dim rounded-[24px] p-6 text-center text-text-secondary text-xs">
            {lang === 'en' ? 'Please log in to see profile stats.' : 'Vui lòng đăng nhập để xem thông tin cá nhân.'}
          </div>
        )}

        {/* Leaderboard Widget */}
        <div className="bg-surface border border-border-dim rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border-dim">
            <span className="text-xl">🏆</span>
            <h3 className="font-bold text-text-primary text-sm font-display tracking-wide uppercase">
              {lang === 'en' ? 'Top Contributors' : 'Bảng Xếp Hạng'}
            </h3>
          </div>
          <div className="space-y-3">
            {leaderboard.length > 0 ? leaderboard.map((l, idx) => (
              <div key={l.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover transition group">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                  idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' :
                  idx === 2 ? 'bg-amber-600/20 text-amber-600 border border-amber-600/30' :
                  'bg-background text-text-muted border border-border-dim'
                }`}>
                  #{idx + 1}
                </div>
                <Avatar src={l.avatar} size="sm" className="w-8 h-8 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-text-primary truncate group-hover:text-accent-primary transition-colors">{l.fullName}</h4>
                  <span className="text-[9px] text-text-muted font-mono">{l.studentId} • {l.major || 'IT'}</span>
                </div>
                <div className="text-[10px] font-bold text-accent-primary bg-accent-primary/10 px-2 py-1 rounded-lg">
                  {l.score} XP
                </div>
              </div>
            )) : (
              <div className="text-center text-xs text-text-muted py-4 font-mono">
                {lang === 'en' ? 'No data available.' : 'Chưa có dữ liệu.'}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
