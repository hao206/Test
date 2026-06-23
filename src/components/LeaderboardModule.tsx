import React, { useEffect, useState } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { translations } from '../translations';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';

export const LeaderboardModule: React.FC = () => {
  const { lang, accent } = useUIStore();
  const t = translations[lang];
  const fetchLeaderboard = useAuthStore(s => s.fetchLeaderboard);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard().then(data => {
      setLeaders(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Đang tải...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 font-sans animate-fade-in">
      <div className="bg-surface border border-border-dim rounded-[32px] p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <Badge variant="info">{lang === 'en' ? 'Hall of Fame' : 'Bảng Vàng Danh Dự'}</Badge>
          <h1 className="text-3xl lg:text-4xl font-black text-text-primary tracking-tight font-display">
            {lang === 'en' ? 'Global Leaderboard' : 'Bảng Xếp Hạng'}
          </h1>
          <p className="text-text-secondary text-sm max-w-md">
            {lang === 'en' ? 'Top contributors recognized by CampusForge community.' : 'Tôn vinh những cá nhân đóng góp tích cực nhất trong hệ sinh thái CampusForge.'}
          </p>
        </div>
        <div className="text-7xl relative z-10 select-none">🏆</div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 blur-[80px] opacity-20 rounded-full" style={{ backgroundColor: accent }} />
      </div>

      <div className="bg-surface border border-border-dim rounded-[24px] overflow-hidden">
        {leaders.length > 0 ? (
          <div className="divide-y divide-border-dim">
            {leaders.map((user, index) => (
              <div key={user.id} className="flex items-center gap-4 p-4 md:p-6 hover:bg-surface-hover transition group">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-lg md:text-xl shrink-0 ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                  index === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' :
                  index === 2 ? 'bg-amber-600/20 text-amber-600 border border-amber-600/30' :
                  'bg-background text-text-muted border border-border-dim'
                }`}>
                  #{index + 1}
                </div>
                
                <Avatar src={user.avatar} size="lg" className="w-12 h-12 md:w-14 md:h-14 shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-primary text-base md:text-lg truncate group-hover:text-accent-primary transition-colors">
                    {user.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-muted font-mono">{user.studentId}</span>
                    <span className="w-1 h-1 rounded-full bg-border-dim" />
                    <span className="text-xs text-text-secondary">{user.major || 'IT'}</span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <div className="text-sm md:text-base font-black text-accent-primary bg-accent-primary/10 px-3 py-1.5 rounded-xl border border-accent-primary/20">
                    {user.score} XP
                  </div>
                  <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">{user.role}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-text-muted font-mono">
            {lang === 'en' ? 'No contributors found.' : 'Chưa có thành viên nào.'}
          </div>
        )}
      </div>
    </div>
  );
};
