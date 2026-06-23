import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, ClipboardCheck, MessageCircle, FileText, Plus, Settings } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useProjectStore } from '../store/useProjectStore';
import { useTaskStore } from '../store/useTaskStore';
import { usePostStore } from '../store/usePostStore';
import { useResourceStore } from '../store/useResourceStore';
import { Badge } from './ui/Badge';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'project' | 'task' | 'post' | 'resource' | 'action';
  route: string;
}

export const GlobalSearch: React.FC = () => {
  const { lang, gQuery, setGQuery, accent } = useUIStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const projects = useProjectStore((s) => s.projects);
  const tasks = useTaskStore((s) => s.tasks);
  const posts = usePostStore((s) => s.posts);
  const resources = useResourceStore((s) => s.resources);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setGQuery('');
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Execute search filters
  const results: SearchResult[] = [];
  
  if (gQuery.trim().length === 0) {
    // Default actions
    results.push({ id: 'action-1', title: lang === 'en' ? 'Create new task' : 'Tạo nhiệm vụ mới', subtitle: 'Quick Action', type: 'action', route: '/teamflow' });
    results.push({ id: 'action-2', title: lang === 'en' ? 'Go to Settings' : 'Cài đặt hệ thống', subtitle: 'Navigation', type: 'action', route: '/settings' });
    results.push({ id: 'action-3', title: lang === 'en' ? 'View Dashboard' : 'Trang tổng quan', subtitle: 'Navigation', type: 'action', route: '/' });
  } else {
    const q = gQuery.toLowerCase();

    // Projects
    projects.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) {
        results.push({
          id: p.id, title: p.name, subtitle: p.category, type: 'project', route: '/projects'
        });
      }
    });

    // Tasks
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q)) {
        results.push({
          id: t.id, title: t.title, subtitle: `${t.projectName} • ${t.status}`, type: 'task', route: '/teamflow'
        });
      }
    });

    // Posts
    posts.forEach((p) => {
      if (p.content.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q)) {
        results.push({
          id: p.id, title: p.content.slice(0, 60) + '...', subtitle: `#${p.topic} by ${p.author}`, type: 'post', route: '/community'
        });
      }
    });

    // Resources
    resources.forEach((r) => {
      if (r.title.toLowerCase().includes(q) && q.length > 0) {
        results.push({
          id: r.id, title: r.title, subtitle: `${r.category}`, type: 'resource', route: '/resources'
        });
      }
    });
  }

  // Handle keyboard interaction
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      }
    }
  };

  const handleSelectResult = (res: SearchResult) => {
    navigate(res.route);
    setIsOpen(false);
    setGQuery('');
  };

  return (
    <>
      {/* Visual Search trigger bar in header */}
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full max-w-md bg-surface/50 border border-border-dim hover:border-border-active rounded-xl p-2 flex items-center justify-between gap-3 cursor-pointer select-none transition-all"
      >
        <div className="flex items-center gap-2 text-text-secondary">
          <Search className="w-4 h-4" />
          <span className="text-[11px] font-medium">
            {lang === 'en' ? 'Search anything...' : 'Tìm mọi thứ...'}
          </span>
        </div>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-surface border border-border-dim text-[9px] font-bold rounded font-mono text-text-muted uppercase select-none shadow-sm">
          Cmd K
        </kbd>
      </div>

      {/* Global Command Palette Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-background/80 backdrop-blur-sm animate-fade-in font-sans">
          <div 
            ref={modalRef}
            className="w-full max-w-2xl bg-surface border border-border-active rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border-dim bg-background/50">
              <Search className="w-5 h-5 text-accent-primary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={gQuery}
                onChange={(e) => {
                  setGQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={lang === 'en' ? 'Type a command or search...' : 'Nhập lệnh hoặc tìm kiếm...'}
                className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none font-medium"
              />
              <kbd className="px-1.5 py-0.5 bg-surface border border-border-dim text-[9px] font-bold rounded font-mono text-text-muted uppercase shrink-0">
                ESC
              </kbd>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
              {results.length === 0 ? (
                <div className="text-center py-10 text-text-muted text-xs">
                  {lang === 'en' ? 'No results found' : 'Không tìm thấy kết quả'}
                </div>
              ) : (
                results.map((res, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={`${res.id}-${res.type}`}
                      onClick={() => handleSelectResult(res)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-surface-hover border-l-2' : 'hover:bg-surface-hover/50 border-l-2 border-transparent'
                      }`}
                      style={{ borderLeftColor: isSelected ? accent : 'transparent' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-lg bg-background border border-border-dim shrink-0`}>
                          {res.type === 'project' && <FolderKanban className="w-4 h-4 text-sky-400" />}
                          {res.type === 'task' && <ClipboardCheck className="w-4 h-4 text-yellow-400" />}
                          {res.type === 'post' && <MessageCircle className="w-4 h-4 text-violet-400" />}
                          {res.type === 'resource' && <FileText className="w-4 h-4 text-emerald-400" />}
                          {res.type === 'action' && res.route === '/teamflow' && <Plus className="w-4 h-4 text-accent-primary" />}
                          {res.type === 'action' && res.route !== '/teamflow' && <Settings className="w-4 h-4 text-text-muted" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-text-primary truncate">{res.title}</h5>
                          <span className="text-[10px] text-text-muted truncate block">{res.subtitle}</span>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-background text-[8px] border-border-dim shrink-0 ml-2">
                        {res.type}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="bg-background/50 px-4 py-2 border-t border-border-dim flex justify-between items-center text-[10px] text-text-muted font-mono">
              <div className="flex gap-4">
                <span><kbd className="bg-surface px-1 py-0.5 rounded border border-border-dim mr-1">↑</kbd><kbd className="bg-surface px-1 py-0.5 rounded border border-border-dim">↓</kbd> to navigate</span>
                <span><kbd className="bg-surface px-1 py-0.5 rounded border border-border-dim">Enter</kbd> to select</span>
              </div>
              <span className="text-accent-primary font-bold">CampusForge Engine</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
