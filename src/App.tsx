import React, { Suspense, lazy, useState, useEffect } from 'react';
import { 
  BrowserRouter, Routes, Route, Link, useLocation, useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, ClipboardCheck, MessageCircle, 
  FileText, Award, Settings, ShieldCheck, LogOut, X
} from 'lucide-react';

// Core translations
import { translations } from './translations';

// Custom Zustand Stores
import { useUIStore } from './store/useUIStore';
import { useAuthStore } from './store/useAuthStore';
import { useNotificationStore } from './store/useNotificationStore';
import { useToastStore } from './store/useToastStore';
import { useAdminStore } from './store/useAdminStore';
import { useAuditStore } from './store/useAuditStore';
import { Role } from './types';

// Auth View
import { AuthModule } from './components/AuthModule';

// Global Search
import { ToastStack } from './components/layout/ToastStack';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/Admin'));
const ProjectHubModule = lazy(() => import('./components/ProjectHubModule').then((module) => ({ default: module.ProjectHubModule })));
const TeamFlowModule = lazy(() => import('./components/TeamFlowModule').then((module) => ({ default: module.TeamFlowModule })));
const CommunityModule = lazy(() => import('./components/CommunityModule').then((module) => ({ default: module.CommunityModule })));
const ResourceModule = lazy(() => import('./components/ResourceModule').then((module) => ({ default: module.ResourceModule })));

const RouteSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
    <div className="lg:col-span-8 h-64 rounded-2xl bg-white/5 border border-white/5" />
    <div className="lg:col-span-4 h-64 rounded-2xl bg-white/5 border border-white/5" />
    <div className="lg:col-span-6 h-40 rounded-2xl bg-white/5 border border-white/5" />
    <div className="lg:col-span-6 h-40 rounded-2xl bg-white/5 border border-white/5" />
  </div>
);


// --- APP CONTENT LAYOUT WRAPPER ---
const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { lang, setLang, accent, mobileMenuOpen, setMobileMenuOpen, guestBlockAction, setGuestBlockAction } = useUIStore();
  const t = translations[lang];

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Notifications Store
  const { notifications } = useNotificationStore();

  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.hasAttribute('contenteditable')
      ) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '?')) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }

      const key = e.key.toLowerCase();
      if (key === 'd') {
        navigate('/');
        addToast(lang === 'en' ? 'Navigated to Dashboard' : 'Đã chuyển sang Trang tổng quan', 'info');
      } else if (key === 'p') {
        navigate('/projects');
        addToast(lang === 'en' ? 'Navigated to Project Hub' : 'Đã chuyển sang Cổng dự án', 'info');
      } else if (key === 't') {
        navigate('/teamflow');
        addToast(lang === 'en' ? 'Navigated to TeamFlow' : 'Đã chuyển sang Quy trình nhóm', 'info');
      } else if (key === 'c') {
        navigate('/community');
        addToast(lang === 'en' ? 'Navigated to Community' : 'Đã chuyển sang Cộng đồng', 'info');
      } else if (key === 'r') {
        navigate('/resources');
        addToast(lang === 'en' ? 'Navigated to Resources' : 'Đã chuyển sang Thư viện tài nguyên', 'info');
      } else if (key === 'l') {
        navigate('/achievements');
        addToast(lang === 'en' ? 'Navigated to Leaderboard' : 'Đã chuyển sang Xếp hạng & Huy chương', 'info');
      } else if (key === 's') {
        navigate('/settings');
        addToast(lang === 'en' ? 'Navigated to Settings' : 'Đã chuyển sang Cơ bản & Giao diện', 'info');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, addToast, lang]);

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
    <div className="min-h-screen bg-background text-text-primary flex select-none relative [color-scheme:dark]">
      {/* Dynamic accent background layout glow */}
      <div 
        className="fixed top-0 left-12 w-[400px] h-[400px] blur-[150px] opacity-5 rounded-full pointer-events-none transition-all duration-700" 
        style={{ backgroundColor: accent }}
      />

      {/* LEFT PERSISTENT NAVIGATION SIDEBAR FOR DESKTOP */}
      <Sidebar />

      {/* MAIN CONTAINER CONTENT DECK */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* TOP GLASSMORPHIC HEADER CENTER */}
        <Header />

        {/* MOBILE Sidenav Drawer overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[100] flex flex-col p-6 space-y-6 lg:hidden font-sans animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-border-dim">
              <span className="text-base font-black text-text-primary tracking-widest font-display uppercase">{t.appName}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-text-secondary hover:text-text-primary cursor-pointer transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {tabItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left text-sm ${
                    isActive(item.path) 
                      ? 'border-border-active text-text-primary font-bold shadow-sm' 
                      : 'border-transparent text-text-secondary hover:bg-surface-hover'
                  }`}
                  style={{ 
                    backgroundColor: isActive(item.path) ? `${accent}15` : 'transparent',
                    color: isActive(item.path) ? accent : undefined
                  }}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-border-dim space-y-4">
              {user && (
                <div className="flex justify-between text-xs text-text-secondary font-mono">
                  <span>Reputation XP:</span>
                  <span className="text-text-primary font-bold">{user.reputationScore}</span>
                </div>
              )}
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }} 
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-colors"
              >
                {t.terminateSession}
              </button>
            </div>
          </div>
        )}

        {/* Guest Mode alert banner */}
        {user?.role === 'Guest' && (
          <div className="mx-4 md:mx-8 mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans animate-fade-in relative overflow-hidden select-none">
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accent }} />
            <div className="flex items-center gap-3">
              <span className="text-xl shrink-0">👀</span>
              <div>
                <h4 className="text-yellow-400 font-bold uppercase tracking-wide">{t.guestModeBannerTitle}</h4>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  {t.guestModeBannerDesc}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 hover:scale-105 active:scale-95 transition text-black font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer shrink-0"
              style={{ backgroundColor: accent }}
            >
              {t.guestModeLoginBtn}
            </button>
          </div>
        )}

        {/* ROUTER SWITCH VIEWPORT */}
        <main className="p-4 md:p-8 flex-grow">
          <Suspense fallback={<RouteSkeleton />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectHubModule />} />
              <Route path="/teamflow" element={<TeamFlowModule />} />
              <Route path="/community" element={<CommunityModule />} />
              <Route path="/resources" element={<ResourceModule />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Suspense>
        </main>

        {/* BOTTOM NAV FOR MOBILE */}
        <footer className="lg:hidden h-[68px] border-t border-border-dim bg-surface/90 backdrop-blur-xl sticky bottom-0 z-40 flex justify-around items-center px-2 shrink-0 select-none pb-safe">
          {tabItems.slice(0, 4).map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all cursor-pointer ${active ? 'bg-background shadow-sm border border-border-dim' : 'hover:bg-surface-hover'}`}
                style={{ color: active ? accent : 'var(--text-muted)' }}
              >
                <item.icon className={`w-5 h-5 shrink-0 transition-transform ${active ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-medium font-mono mt-1 tracking-tight truncate w-full text-center">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </footer>

      </div>

      {/* Guest Block action alerts popup */}
      {guestBlockAction && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-[32px] p-8 shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="inline-flex w-16 h-16 rounded-3xl bg-yellow-500/10 border border-yellow-500/30 items-center justify-center mb-4">
                <span className="text-3xl text-yellow-500">🔒</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight font-display mb-2 uppercase">Yêu Cầu Thành Viên</h3>
              <p className="text-slate-400 text-xs text-center">
                Bạn đang truy cập hệ thống <strong className="text-[#CCFF00]" style={{ color: accent }}>CampusForge</strong> với tư cách là <strong className="text-white">Khách (Guest Mode)</strong>.
              </p>
            </div>

            <div className="bg-[#161616] border border-white/5 rounded-2xl p-4 mb-6">
              <p className="text-slate-300 text-xs font-semibold uppercase font-mono mb-1 tracking-wider text-center">Hành động bị hạn chế:</p>
              <div className="text-white text-xs font-bold text-center bg-black/30 py-2.5 rounded-lg font-mono">
                {guestBlockAction}
              </div>
              <p className="text-slate-400 text-[11px] mt-2 text-center leading-relaxed font-sans">
                Chế độ khách chỉ cho phép tra cứu, xem dữ liệu, và tải tài liệu học tập. Vui lòng đăng nhập bằng tài khoản sinh viên/admin để đăng tin hoặc thực hiện các hoạt động nhóm khác.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setGuestBlockAction(null);
                  handleLogout();
                }}
                className="w-full py-3 hover:scale-[1.01] active:scale-95 transition text-black font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer shadow-lg"
                style={{ backgroundColor: accent }}
              >
                🔐 Đăng Nhập Tài Khoản
              </button>
              <button
                type="button"
                onClick={() => setGuestBlockAction(null)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold rounded-xl transition duration-200 cursor-pointer border border-white/5"
              >
                Trở lại duyệt (Khách)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts overlay panel modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xl">⌨️</span>
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                  {lang === 'en' ? 'Keyboard Navigation Shortcuts' : 'Phím tắt Điều Thướng Nhanh'}
                </h3>
              </div>
              <button 
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-500 hover:text-white text-xs font-mono font-bold uppercase transition px-2 py-1 rounded bg-white/5 active:scale-95"
              >
                {lang === 'en' ? 'Close' : 'Đóng'}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === 'en' 
                ? 'Type these letters dynamic trigger directly when no input fields are active to teleport instantly:' 
                : 'Nhấn các phím tắt sau đây khi không ở trong ô nhập liệu để dịch chuyển tức thời qua phân khu học thuật:'}
            </p>

            <div className="space-y-2 pt-2">
              {[
                { keys: ['?'], label: lang === 'en' ? 'Toggle this helpers guide popup' : 'Bật/Tắt hướng dẫn phím tắt này' },
                { keys: ['D'], label: lang === 'en' ? 'Teleport to Dashboard overview' : 'Xem Trang tổng quan' },
                { keys: ['P'], label: lang === 'en' ? 'Teleport to Project Initiatives Hub' : 'Xem Cổng đề tài khoa học' },
                { keys: ['T'], label: lang === 'en' ? 'Teleport to TeamFlow Agile Kanban Board' : 'Xem Quy trình nhóm Sprint' },
                { keys: ['C'], label: lang === 'en' ? 'Teleport to Community Discussion Threads' : 'Xem Diễn đàn Cộng đồng' },
                { keys: ['R'], label: lang === 'en' ? 'Teleport to Shared Resource Vault' : 'Xem Thư viện giáo trình & Cố vấn' },
                { keys: ['L'], label: lang === 'en' ? 'Teleport to Leaderboard & Badges Index' : 'Xem Xếp hạng & Huy chương' },
                { keys: ['S'], label: lang === 'en' ? 'Teleport to Personalization Layout' : 'Truy cập tab Cá nhân hóa' },
              ].map((shortcut, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-none text-xs">
                  <span className="text-slate-300 font-medium">{shortcut.label}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {shortcut.keys.map(k => (
                      <kbd 
                        key={k} 
                        className="px-2 py-1 bg-white/5 border border-white/10 text-slate-200 rounded font-mono text-[10px] font-bold shadow-sm"
                        style={{ borderColor: `${accent}30` }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0A0A0A] p-3 rounded-2xl text-[10px] text-slate-500 font-mono text-center">
              CampusForge Hotkey Router • Active
            </div>
          </div>
        </div>
      )}

      {/* Real-time custom Toast Notifications Stack Component */}
      <ToastStack />
    </div>
  );
};

// --- CORE APP ENTRY WRAPPER ---
export default function App() {
  const user = useAuthStore((s) => s.user);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest);
  const addLog = useAuditStore((s) => s.addLog);
  const { lang, accent } = useUIStore();
  const t = translations[lang];

  // On mount: refresh user from API if token exists (handles page reload)
  useEffect(() => {
    document.title = t.appName;
    refreshMe();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4 relative [color-scheme:dark]">
        <div className="fixed top-1/4 left-1/4 w-[350px] h-[350px] bg-accent-primary blur-[150px] opacity-[0.03] rounded-full pointer-events-none" />
        <div className="w-full max-w-md">
          <AuthModule
            t={t}
            accentColor={accent}
            onLoginSuccess={() => {}}
            logAction={(action, moduleName) => addLog(action, moduleName, 'Auth')}
            onContinueAsGuest={loginAsGuest}
          />
        </div>
        <ToastStack />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
