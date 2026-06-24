import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, X } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useProjectStore } from '../../store/useProjectStore';
import { translations } from '../../translations';
import { GlobalSearch } from '../GlobalSearch';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang, accent, setMobileMenuOpen } = useUIStore();
  const t = translations[lang];
  const user = useAuthStore((s) => s.user);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);

  // Notifications Store
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, clearAll, deleteNotification } = useNotificationStore();
  
  React.useEffect(() => {
    if (user && user.role !== 'Guest') {
      fetchNotifications();
    }
  }, [user]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 border-b border-border-dim px-4 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between shrink-0 select-none">
      
      {/* Logo and Search widgets */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 bg-surface hover:bg-surface-hover rounded-xl text-text-secondary hover:text-text-primary cursor-pointer border border-border-dim"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <GlobalSearch />
      </div>

      {/* Right utilities */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* Lang toggle */}
        <button 
          onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
          className="p-2.5 min-w-[44px] h-10 rounded-2xl border border-border-dim text-[10px] font-mono font-bold text-text-primary tracking-tight bg-surface hover:bg-surface-hover transition cursor-pointer"
        >
          {lang === 'en' ? t.vietnamese.toUpperCase().slice(0,2) : t.english.toUpperCase().slice(0,2)}
        </button>

        {/* Notification drop center */}
        <div className="font-sans">
          <button 
            onClick={() => setShowNotificationDrawer(true)}
            className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-hover border border-border-dim rounded-2xl transition relative cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <div className="w-4 h-4 bg-red-500 text-white rounded-full absolute -top-1 -right-1 text-[8px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                {unreadCount}
              </div>
            )}
          </button>

          {showNotificationDrawer && createPortal(
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm animate-fade-in"
                onClick={() => setShowNotificationDrawer(false)}
              />
              {/* Side Panel Inbox */}
              <div className="fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-surface border-l border-border-dim shadow-2xl z-[100] flex flex-col animate-slide-in-right font-sans">
                <div className="flex items-center justify-between p-6 border-b border-border-dim bg-background/50">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-text-primary tracking-tight font-display">{lang === 'en' ? 'Inbox' : 'Hộp thư'}</h3>
                    <p className="text-[10px] text-text-muted font-mono">{unreadCount} {lang === 'en' ? 'unread logs' : 'tin chưa đọc'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[10px] hover:underline font-mono font-bold" style={{ color: accent }}>Read All</button>}
                    <button onClick={() => setShowNotificationDrawer(false)} className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-surface hover:bg-surface-hover p-2 rounded-xl border border-transparent hover:border-border-dim">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.targetId) setSelectedProjectId(notif.targetId);
                        
                        if (notif.type === 'task') navigate('/teamflow');
                        if (notif.type === 'apply' || notif.type === 'success') navigate('/projects');
                        if (notif.type === 'comment') navigate('/community');
                        if (notif.type === 'badge') navigate('/leaderboard');
                        if (notif.type === 'admin') navigate('/admin');
                        setShowNotificationDrawer(false);
                      }}
                      className={`p-4 rounded-2xl flex flex-col space-y-1.5 transition cursor-pointer border ${
                        notif.read 
                          ? 'bg-transparent border-border-dim hover:bg-surface-hover' 
                          : 'bg-surface-hover border-border-active shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`${notif.read ? 'text-text-secondary' : 'text-text-primary'} font-bold pr-2`}>{notif.title}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {!notif.read && <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: accent }} />}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="text-text-muted hover:text-red-500 transition-colors p-1"
                            title={lang === 'en' ? 'Delete' : 'Xóa'}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed font-sans break-words whitespace-pre-wrap">{notif.description}</p>
                      <span className="text-[9px] text-text-muted font-mono mt-2 inline-block bg-background px-2 py-0.5 rounded border border-border-dim">{notif.time}</span>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-text-muted text-xs font-mono space-y-4">
                      <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center border border-border-dim">
                        <Bell className="w-6 h-6 opacity-20" />
                      </div>
                      <span>{lang === 'en' ? "You're all caught up!" : "Không có thông báo mới"}</span>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-4 border-t border-border-dim bg-background/50">
                    <button onClick={clearAll} className="w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-wider text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer">
                      {lang === 'en' ? 'Clear All Logs' : 'Xóa tất cả'}
                    </button>
                  </div>
                )}
              </div>
            </>,
            document.body
          )}
        </div>

        {/* Profile Avatar Quick Navigator */}
        {user && (
          <div className="flex items-center gap-2 border-l border-border-dim pl-2 md:pl-4">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-black text-text-primary hover:text-accent-primary cursor-pointer transition-colors" onClick={() => navigate('/profile/me')}>{user.fullName}</div>
              <div className="text-[9px] text-text-muted font-sans tracking-tight">{user.major.split(' ')[0]}</div>
            </div>
            <img 
              onClick={() => navigate('/profile/me')}
              src={user.avatar} 
              className="w-9 h-9 rounded-full object-cover border border-border-dim cursor-pointer hover:border-border-active transition" 
              alt="me avatar" 
            />
          </div>
        )}
      </div>
    </header>
  );
};
