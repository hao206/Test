import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, ClipboardCheck, MessageCircle, 
  FileText, Award, Settings, ShieldCheck, LogOut
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { translations } from '../../translations';

export const Sidebar: React.FC = () => {
  const { lang, accent } = useUIStore();
  const t = translations[lang];
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isGovUser = user?.role === 'Admin' || user?.role === 'Super Admin';

  const tabItems = [
    { label: t.dashboard, path: '/', icon: LayoutDashboard },
    { label: t.projectHub, path: '/projects', icon: FolderKanban },
    { label: t.teamFlow, path: '/teamflow', icon: ClipboardCheck },
    { label: t.community, path: '/community', icon: MessageCircle },
    { label: t.settings, path: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden lg:flex w-72 border-r border-border-dim flex-col justify-between p-6 sticky top-0 h-screen shrink-0 font-sans z-50">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-black tracking-tighter text-sm italic transition duration-500 shadow-[0_0_20px_rgba(204,255,0,0.3)] select-none" 
            style={{ backgroundColor: accent }}
          >
            CF
          </div>
          <div>
            <span className="text-sm font-black text-text-primary tracking-widest font-display block uppercase">{t.appName}</span>
            <span className="text-[9px] font-mono font-bold text-text-muted tracking-wider">v4.0.0 PROD STABLE</span>
          </div>
        </div>

        <nav className="space-y-1.5 pt-4">
          {tabItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left text-xs font-semibold leading-none cursor-pointer ${
                isActive(item.path) 
                  ? 'border-border-active text-text-primary font-black' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
              style={{ 
                backgroundColor: isActive(item.path) ? `${accent}15` : 'transparent',
                color: isActive(item.path) ? accent : undefined
              }}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}

          {isGovUser && (
            <Link
              to="/admin"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left text-xs font-semibold leading-none cursor-pointer ${
                isActive('/admin') 
                  ? 'border-border-active text-text-primary font-black' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
              style={{ 
                backgroundColor: isActive('/admin') ? `${accent}15` : 'transparent',
                color: isActive('/admin') ? accent : undefined
              }}
            >
              <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
              <span>{lang === 'en' ? 'Audit Logs' : 'Nhật ký Hệ thống'}</span>
            </Link>
          )}
        </nav>
      </div>

      {user && (
        <div className="bg-surface/90 rounded-[28px] p-5 border border-border-dim relative overflow-hidden select-none">
          <div className="relative z-10 space-y-3">
            <div className="flex justify-between text-[10px] text-text-muted font-mono font-bold uppercase tracking-wider">
              <span>Reputation Stats</span>
              <span>{user.reputationScore} XP</span>
            </div>
            <div className="w-full bg-border-dim h-1 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((user.reputationScore / 5000) * 100, 100)}%`, backgroundColor: accent }}
              />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <img src={user.avatar} className="w-6.5 h-6.5 rounded-full object-cover border border-border-dim" alt="user avatar" />
                <span className="text-[10px] font-bold text-text-primary max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
                <span className="uppercase text-[10px] tracking-wider">{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
