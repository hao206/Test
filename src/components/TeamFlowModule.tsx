import React, { useState, useEffect } from 'react';
import { 
  Flame, ArrowRight, ArrowLeft, CheckCircle2, Plus, Bell, Image, FileText, Calendar, User, Paperclip, Trash2, X, MessageSquare, Users, Check
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { translations } from '../translations';

// Zustand store imports
import { useUIStore } from '../store/useUIStore';
import { useTaskStore } from '../store/useTaskStore';
import { useProjectStore } from '../store/useProjectStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAuditStore } from '../store/useAuditStore';
import { useToastStore } from '../store/useToastStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useChatStore } from '../store/useChatStore';

// @dnd-kit core imports
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';

import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';

// --- SUBMODULE components ---

interface DraggableCardProps {
  task: Task;
  accentColor: string;
  lang: string;
  handlePrevStatus: (id: string, st: TaskStatus) => void;
  handleNextStatus: (id: string, st: TaskStatus) => void;
  handleDeleteTask: (id: string) => void;
  colValue: TaskStatus;
  onCardClick: (task: Task) => void;
}

const DraggableTaskCard: React.FC<DraggableCardProps> = ({
  task,
  accentColor,
  lang,
  handlePrevStatus,
  handleNextStatus,
  handleDeleteTask,
  colValue,
  onCardClick
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'pointer',
    touchAction: 'none',
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onCardClick(task)}
      className="bg-surface border border-border-dim rounded-xl p-3 space-y-2 hover:border-border-active transition-all shadow-sm group select-none relative cursor-pointer"
    >
      <div className="flex justify-between items-start gap-2">
        <Badge variant="default" className="text-[8px] bg-background border-border-dim px-1.5 truncate max-w-[150px]">{task.projectName}</Badge>
        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
            className="text-text-muted hover:text-red-500 transition cursor-pointer"
            title={lang === 'en' ? 'Delete Task' : 'Xóa công việc'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
          <div className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${
            task.priority === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
            task.priority === 'Medium' ? 'bg-amber-400' :
            'bg-blue-400'
          }`} title={task.priority || 'Medium'} />
        </div>
      </div>
      
      <h4 className="text-xs font-bold text-text-primary leading-tight group-hover:text-accent-primary transition-colors line-clamp-2">
        {task.title}
      </h4>

      {(task.notes || (task.attachments && task.attachments.length > 0) || task.reminderDate) && (
        <div className="flex items-center gap-2 pt-1 text-[9px] text-text-muted">
          {task.notes && (
            <span className="flex items-center gap-0.5 text-text-secondary" title="Has notes">
              <FileText className="w-2.5 h-2.5" /> Note
            </span>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-text-secondary" title="Attachments">
              <Paperclip className="w-2.5 h-2.5" /> {task.attachments.length}
            </span>
          )}
          {task.reminderDate && (
            <span className="flex items-center gap-0.5 text-amber-400 font-bold" title={`Reminder: ${task.reminderDate}`}>
              <Bell className="w-2.5 h-2.5 animate-bounce" /> {task.reminderDate}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-[9px] text-text-muted font-mono flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-text-muted" /> {task.dueDate}
        </span>
        {task.assignedTo && typeof task.assignedTo === 'object' && (task.assignedTo as any).avatar ? (
          <Avatar src={(task.assignedTo as any).avatar} size="sm" className="w-5 h-5 border-surface shadow-sm" />
        ) : task.assignedAvatar ? (
          <Avatar src={task.assignedAvatar} size="sm" className="w-5 h-5 border-surface shadow-sm" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-surface-hover border border-border-dim flex items-center justify-center text-[8px] text-text-secondary font-bold">
            {task.assignedTo && typeof task.assignedTo === 'object' 
              ? (((task.assignedTo as any).fullName || '?').charAt(0).toUpperCase())
              : (task.assignedTo && typeof task.assignedTo === 'string' ? task.assignedTo.charAt(0).toUpperCase() : '?')}
          </div>
        )}
      </div>

      {/* Mobile-Friendly status movement buttons: subtle peek on desktop */}
      <div 
        className="flex justify-between gap-1.5 pt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" 
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {colValue !== 'Backlog' ? (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStatus(task.id, task.status);
            }}
            className="flex-1 py-1 bg-background hover:bg-surface-hover border border-border-dim text-text-secondary rounded text-[8px] font-bold transition flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
        ) : <div className="flex-1" />}
        
        {colValue !== 'Done' ? (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNextStatus(task.id, task.status);
            }}
            className="flex-1 py-1 text-black font-black uppercase rounded transition flex items-center justify-center cursor-pointer hover:brightness-110"
            style={{ backgroundColor: accentColor }}
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <div className="flex-1 text-center text-emerald-400 text-[9px] font-bold flex items-center justify-center gap-1 bg-emerald-500/10 rounded border border-emerald-500/20 py-1">
            <CheckCircle2 className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
};

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`space-y-3 flex-1 overflow-y-auto max-h-[650px] min-h-[200px] p-2 rounded-xl transition-all scrollbar-hide ${
        isOver ? 'bg-surface-hover/80 border border-dashed border-border-active' : 'bg-transparent border border-transparent'
      }`}
    >
      {children}
    </div>
  );
};

// --- MAIN PORT MODULE ---

interface TeamFlowProps {
  // Configurable is optional now we use Zustand stores
  currentUserRole?: string;
}

export const TeamFlowModule: React.FC<TeamFlowProps> = ({
  currentUserRole
}) => {
  const { lang, accent: accentColor } = useUIStore();
  const t = translations[lang];

  const tasks = useTaskStore((state) => state.tasks);
  const projects = useProjectStore((state) => state.projects);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const fetchMyProjects = useProjectStore((state) => state.fetchMyProjects);

  const { messages, fetchMessages, sendMessage } = useChatStore();

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatMessagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMyProjects().then(() => {
      const myProjects = useProjectStore.getState().projects;
      const finalizedProject = myProjects.find(p => p.status === 'Active' || p.status === 'Completed');
      if (finalizedProject) {
        setActiveProjectId(finalizedProject.id);
        fetchTasks(finalizedProject.id);
      } else if (myProjects[0]) {
        setActiveProjectId(myProjects[0].id);
        fetchTasks(myProjects[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeProjectId) return;
    const interval = setInterval(() => {
      fetchTasks(activeProjectId);
      if (showChat) fetchMessages(activeProjectId);
    }, 15000);
    return () => clearInterval(interval);
  }, [activeProjectId, showChat]);

  useEffect(() => {
    if (activeProjectId && showChat) {
      fetchMessages(activeProjectId);
    }
  }, [activeProjectId, showChat]);

  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showChat]);
  const user = useAuthStore((state) => state.user);
  const addLog = useAuditStore((state) => state.addLog);
  const addToast = useToastStore((state) => state.addToast);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const addReputation = useAuthStore((state) => state.addReputation);

  const activeUserRole = currentUserRole || user?.role || 'Student';

  const [showAddTask, setShowAddTask] = useState(false);
  const [showGuestBlockModal, setShowGuestBlockModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskAssigned, setTaskAssigned] = useState('Alex Nguyen');
  const [taskDueDate, setTaskDueDate] = useState('2026-06-25');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Focalboard Task Detail state
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [detailNotes, setDetailNotes] = useState('');
  const [detailReminder, setDetailReminder] = useState('');
  const [detailNewAttachmentUrl, setDetailNewAttachmentUrl] = useState('');
  const [detailNewAttachmentName, setDetailNewAttachmentName] = useState('');

  useEffect(() => {
    if (selectedTaskForDetail) {
      setDetailNotes(selectedTaskForDetail.notes || '');
      setDetailReminder(selectedTaskForDetail.reminderDate || '');
      setDetailNewAttachmentUrl('');
      setDetailNewAttachmentName('');
    }
  }, [selectedTaskForDetail]);

  const { participatedProjects, activeParticipatedCount } = React.useMemo(() => {
    if (!projects || projects.length === 0) return { participatedProjects: [], activeParticipatedCount: 0 };
    const myName = user?.fullName || '';
    const myId = user?.id || '';
    
    let filtered = projects;
    if (activeUserRole !== 'Admin' && activeUserRole !== 'Super Admin' && activeUserRole !== 'Moderator') {
      const myProjs = projects.filter(p => p.leaderId === myId || p.leaderName === myName || (p.members && p.members.includes(myName)));
      if (myProjs.length > 0) filtered = myProjs;
    }
    
    const activeCount = filtered.filter(p => p.status !== 'Completed' && p.status !== 'Archived').length;
    return { participatedProjects: filtered, activeParticipatedCount: activeCount };
  }, [projects, user, activeUserRole]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const handleSelectProject = (projId: string) => {
    setActiveProjectId(projId);
    setSelectedProjectId(projId);
    fetchTasks(projId);
    fetchMessages(projId);
  };

  const columns: { label: string; value: TaskStatus; color: string }[] = [
    { label: lang === 'en' ? 'Backlog' : 'Tồn đọng', value: 'Backlog', color: '#ff007f' },
    { label: lang === 'en' ? 'To Do' : 'Cần làm', value: 'To Do', color: '#00e5ff' },
    { label: lang === 'en' ? 'Doing' : 'Đang làm', value: 'Doing', color: '#ffb300' },
    { label: lang === 'en' ? 'Review' : 'Đánh giá', value: 'Review', color: '#bd00ff' },
    { label: lang === 'en' ? 'Done' : 'Hoàn thành', value: 'Done', color: '#10b981' }
  ];

  const handleNextStatus = (taskId: string, currentStatus: TaskStatus) => {
    if (activeUserRole === 'Guest') {
      setShowGuestBlockModal(true);
      return;
    }
    const statusOrder: TaskStatus[] = ['Backlog', 'To Do', 'Doing', 'Review', 'Done'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      updateTaskStatus(taskId, nextStatus).catch(() => {});
      addLog(`Advanced task status from '${currentStatus}' to '${nextStatus}'`, 'TeamFlow Pro', user?.fullName || 'Academic Peer');
      addToast(lang === 'en' ? `Task moved to ${nextStatus}` : `Nhiệm vụ chuyển sang ${nextStatus}`, 'info');
      
      if (nextStatus === 'Done') {
        addToast(lang === 'en' ? `Earned +120 Reputation Points!` : `Nhận +120 Điểm Uy Tín!`, 'success');
        addNotification(
          lang === 'en' ? 'Sprint Task Completed ✓' : 'Công việc hoàn thành ✓',
          `You compiled and completed the task card. Dynamic sprint velocity metrics recalculated.`,
          'task'
        );
      }
    }
  };

  const handlePrevStatus = (taskId: string, currentStatus: TaskStatus) => {
    if (activeUserRole === 'Guest') {
      setShowGuestBlockModal(true);
      return;
    }
    const statusOrder: TaskStatus[] = ['Backlog', 'To Do', 'Doing', 'Review', 'Done'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex > 0) {
      const prevStatus = statusOrder[currentIndex - 1];
      updateTaskStatus(taskId, prevStatus).catch(() => {});
      addLog(`Moved task status back from '${currentStatus}' to '${prevStatus}'`, 'TeamFlow Pro', user?.fullName || 'Academic Peer');
      addToast(lang === 'en' ? `Task moved back to ${prevStatus}` : `Trở lại trạng thái ${prevStatus}`, 'info');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (activeUserRole === 'Guest') {
      setShowGuestBlockModal(true);
      return;
    }
    if (window.confirm(lang === 'en' ? 'Delete this task permanently?' : 'Xóa công việc này vĩnh viễn?')) {
      deleteTask(taskId).then(() => {
        addToast(lang === 'en' ? 'Task deleted permanently' : 'Đã xóa công việc vĩnh viễn', 'success');
        addLog(`Deleted task ${taskId}`, 'TeamFlow Pro', user?.fullName || 'Academic Peer');
      }).catch((err: any) => {
        addToast(err.message || 'Failed to delete task', 'error');
      });
    }
  };

  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUserRole === 'Guest') {
      setShowGuestBlockModal(true);
      return;
    }
    if (!taskTitle) return;

    if (taskTitle.length < 5) {
      addToast(
        lang === 'en' ? 'Task title must be at least 5 characters long.' : 'Tiêu đề công việc phải có ít nhất 5 ký tự.',
        'error'
      );
      return;
    }

    const projId = selectedProjectId || activeProjectId || projects[0]?.id;
    if (!projId) { addToast('Vui lòng chọn dự án.', 'error'); return; }
    try {
      await addTask({
        projectId: projId,
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        status: 'To Do',
        dueDate: taskDueDate,
      } as any);
      addLog(`Dispatched new plan work: ${taskTitle}`, 'TeamFlow Pro', user?.fullName || '');
      addToast(lang === 'en' ? 'Task created!' : 'Tạo task thành công!', 'success');
      setTaskTitle('');
      setTaskDesc('');
      setShowAddTask(false);
    } catch (err: any) {
      addToast(err.message || 'Tạo task thất bại.', 'error');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (activeUserRole === 'Guest') {
      setShowGuestBlockModal(true);
      return;
    }

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const matchedTask = tasks.find((t) => t.id === taskId);
    if (!matchedTask) return;

    if (matchedTask.status !== newStatus) {
      updateTaskStatus(taskId, newStatus).catch(() => {});
      addLog(`Dragged task '${matchedTask.title}' to column '${newStatus}'`, 'TeamFlow Pro', user?.fullName || 'Academic Peer');
      addToast(lang === 'en' ? `Task moved to ${newStatus}` : `Đã chuyển nhiệm vụ sang ${newStatus}`, 'success');

      if (newStatus === 'Done') {
        addToast(lang === 'en' ? `Earned +120 Reputation Points!` : `Nhận +120 Điểm Uy Tín!`, 'success');
        addNotification(
          lang === 'en' ? 'Sprint Task Completed ✓' : 'Công việc hoàn thành ✓',
          `You dragged task "${matchedTask.title}" to Done. Agile stats updated dynamically!`,
          'task'
        );
      }
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const totalTasks = tasks.length || 1;
  const sprintBurnProgress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="p-1 md:p-4 space-y-6">
        {/* Unified Sleek TeamFlow Header */}
        <div className="bg-surface border border-border-dim rounded-[24px] p-4 space-y-4 shadow-sm">
          {/* Top row: Switcher Tabs & Quick Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              <div className="flex items-center gap-1.5 shrink-0 bg-background px-3 py-1.5 rounded-xl border border-border-dim">
                <Users className="w-4 h-4 text-accent-primary" />
                <span className="text-xs font-bold text-text-primary">
                  {lang === 'en' ? 'My Projects' : 'Dự án tham gia'}:
                </span>
                <Badge variant={activeParticipatedCount >= 3 ? 'warning' : 'info'} className="text-[10px] py-0 px-1.5 font-mono">
                  {activeParticipatedCount}/3 {lang === 'en' ? 'Active' : 'Đang làm'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {participatedProjects.map(proj => {
                  const isActive = proj.id === activeProjectId;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => handleSelectProject(proj.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                        isActive 
                          ? 'text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] font-black' 
                          : 'bg-background hover:bg-surface-hover text-text-secondary border border-border-dim'
                      }`}
                      style={isActive ? { backgroundColor: accentColor } : {}}
                    >
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-black animate-pulse' : 'bg-text-muted'}`} />
                      <span>{proj.name}</span>
                      <Badge variant={isActive ? 'default' : 'outline'} className={`text-[9px] py-0 px-1 ${isActive ? 'bg-black/20 text-black border-transparent' : 'text-text-muted'}`}>
                        {proj.status === 'Completed' ? '✔' : proj.status}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions right bar */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              {activeProject && (
                <div className="flex items-center -space-x-2 overflow-hidden mr-1">
                  {(activeProject.members || ['Alex Nguyen', 'Linh Dang', 'Minh Hoang']).slice(0, 4).map((m, idx) => (
                    <div key={idx} className="inline-block h-7 w-7 rounded-full ring-2 ring-surface bg-surface-hover border border-border-dim flex items-center justify-center text-[10px] font-bold text-text-primary shadow-sm" title={m}>
                      {m.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  if (!activeProject) return;
                  addNotification(
                    lang === 'en' ? `⚠️ Reminder: ${activeProject.name}` : `⚠️ Nhắc nhở: ${activeProject.name}`,
                    lang === 'en' 
                      ? `Reminder broadcasted to all members of "${activeProject.name}" to check Kanban workflow!`
                      : `Thông báo nhắc nhở tiến độ đã gửi đến các thành viên trong dự án "${activeProject.name}"!`,
                    'task'
                  );
                  addToast(lang === 'en' ? 'Progress reminder broadcasted to team!' : 'Đã gửi thông báo nhắc nhở thành viên!', 'success');
                  addLog(`Broadcasted reminder for ${activeProject.name}`, 'TeamFlow Pro', user?.fullName || 'Leader');
                }}
                className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title={lang === 'en' ? 'Send reminder to project team' : 'Gửi nhắc nhở tiến độ cho nhóm'}
              >
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span className="hidden sm:inline">{lang === 'en' ? 'Reminder' : 'Nhắc nhở'}</span>
              </button>

              <Button 
                size="sm"
                onClick={() => {
                  if (activeUserRole === 'Guest') {
                    setShowGuestBlockModal(true);
                  } else {
                    setShowAddTask(true);
                  }
                }}
                className="text-xs py-1.5 px-3 h-auto"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> {lang === 'en' ? 'New Task' : 'Thêm thẻ'}
              </Button>
              
              <Button 
                variant={showChat ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (activeUserRole === 'Guest') {
                    setShowGuestBlockModal(true);
                  } else {
                    setShowChat(!showChat);
                  }
                }}
                className={`text-xs py-1.5 px-3 h-auto flex items-center gap-1.5 ${showChat ? 'bg-accent-primary text-black font-bold' : 'bg-background hover:bg-surface-hover'}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Chat' : 'Chat Nhóm'}</span>
                {messages.length > 0 && <Badge variant="default" className={`text-[9px] py-0 px-1 ml-0.5 ${showChat ? 'bg-black text-white' : ''}`}>{messages.length}</Badge>}
              </Button>
            </div>
          </div>

          {/* Bottom row: Compact Project Info & Sprint Progress Bar */}
          {activeProject && (
            <div className="pt-3 border-t border-border-dim/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-text-secondary truncate">
                <Badge variant="info" className="text-[9px] shrink-0">{activeProject.category || 'Agile Flow'}</Badge>
                <span className="font-bold text-text-primary truncate">{activeProject.name}</span>
                <span className="text-text-muted hidden md:inline">— {activeProject.description || 'Quản lý tiến độ biệt lập'}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                  <Flame className="w-3.5 h-3.5 text-yellow-500" />
                  {lang === 'en' ? 'Sprint Burn:' : 'Tiến độ Sprint:'} <strong className="text-text-primary font-mono">{sprintBurnProgress}%</strong> ({completedTasks}/{totalTasks})
                </span>
                <div className="w-28 sm:w-36 bg-background h-2 rounded-full overflow-hidden border border-border-dim">
                  <div 
                    className="h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(204,255,0,0.5)]"
                    style={{ width: `${sprintBurnProgress}%`, backgroundColor: accentColor }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kanban Board Container - Focalboard style horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 items-start w-full snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.value);
            return (
              <div 
                key={col.value} 
                className="bg-surface/30 border border-border-dim rounded-2xl p-3 flex flex-col space-y-3 min-w-[280px] w-[280px] shrink-0 snap-start"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border-dim sticky top-0 bg-background/50 backdrop-blur-md z-10 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: col.color }} />
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{col.label}</span>
                  </div>
                  <Badge variant="default" className="text-[9px] bg-background border-border-dim">{colTasks.length}</Badge>
                </div>

                {/* Droppable Columns Area */}
                <DroppableColumn id={col.value}>
                  {colTasks.map(task => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      accentColor={accentColor}
                      lang={lang}
                      handlePrevStatus={handlePrevStatus}
                      handleNextStatus={handleNextStatus}
                      handleDeleteTask={handleDeleteTask}
                      colValue={col.value}
                      onCardClick={(t) => setSelectedTaskForDetail(t)}
                    />
                  ))}

                  {colTasks.length === 0 && (
                    <div className="h-24 border border-dashed border-border-dim rounded-xl flex items-center justify-center text-[10px] text-text-muted">
                      {lang === 'en' ? 'Drop cards here' : 'Kéo thả vào đây'}
                    </div>
                  )}
                </DroppableColumn>
              </div>
            );
          })}
        </div>

        {/* Dispatch task modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in font-sans">
            <div className="w-full max-w-md bg-surface border border-border-active rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-black text-text-primary font-display">{t.addTaskModalTitle}</h3>
              <p className="text-xs text-text-secondary">
                {lang === 'en' ? 'Introduce new plans coordinates. Newly added tasks append directly onto the To Do column list.' : 'Nhập thông tin kế hoạch và yêu cầu kỹ thuật. Công việc mới sẽ được hiển thị tại cột Cần làm.'}
              </p>

              <form onSubmit={handleAddTaskSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{t.categoryTitle}</label>
                  <select
                    value={selectedProjectId || activeProjectId || projects[0]?.id || ''}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-background border border-border-dim text-xs text-text-primary rounded-xl p-3 focus:outline-none focus:border-accent-primary transition cursor-pointer"
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{t.taskTitleLabel}</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Implement schema indexes' : 'Vd: Thiết kế quan hệ thực thể database'}
                    className="w-full bg-background border border-border-dim text-xs text-text-primary rounded-xl p-3 focus:outline-none focus:border-accent-primary transition placeholder-text-muted"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{t.taskDescLabel}</label>
                  <textarea
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    rows={2}
                    placeholder={lang === 'en' ? 'Reference parameters, acceptance criteria, constraints...' : 'Mô tả đầu ra, tiêu chí kiểm thử, ràng buộc...'}
                    className="w-full bg-background border border-border-dim text-xs text-text-primary rounded-xl p-3 focus:outline-none focus:border-accent-primary transition placeholder-text-muted"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{t.taskPriorityLabel}</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full bg-background border border-border-dim text-xs text-text-primary rounded-xl p-3 focus:outline-none focus:border-accent-primary transition cursor-pointer"
                    >
                      <option value="Low">{lang === 'en' ? 'Low Priority' : 'Mức Thấp'}</option>
                      <option value="Medium">{lang === 'en' ? 'Medium Priority' : 'Mức Trung bình'}</option>
                      <option value="High">{lang === 'en' ? 'High Priority' : 'Mức Cao'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{t.taskDueDateLabel}</label>
                    <input
                      type="date"
                      required
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full bg-background border border-border-dim text-xs text-text-primary rounded-xl p-3 focus:outline-none focus:border-accent-primary transition cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{t.taskAssignedLabel}</label>
                  <select
                    value={taskAssigned}
                    onChange={(e) => setTaskAssigned(e.target.value)}
                    className="w-full bg-background border border-border-dim text-xs text-text-primary rounded-xl p-3 focus:outline-none focus:border-accent-primary transition cursor-pointer"
                  >
                    <option value="Alex Nguyen">Alex Nguyen</option>
                    <option value="Linh Dang">Linh Dang</option>
                    <option value="Minh Hoang">Minh Hoang</option>
                    <option value="Tomas Ly">Tomas Ly</option>
                    <option value="Phuong Mai">Phuong Mai</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddTask(false)}
                  >
                    {t.btnCancel}
                  </Button>
                  <Button
                    type="submit"
                  >
                    {t.btnSubmit}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Guest Mode Restriction Popup Modal Interceptor */}
        {showGuestBlockModal && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in font-sans">
            <div className="w-full max-w-md bg-surface border border-yellow-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-yellow-400">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-black font-display uppercase">{t.guestReqTitle}</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {t.guestDescRestricted}
              </p>
              <div className="flex gap-3 justify-end pt-2">
                <Button 
                  variant="secondary"
                  onClick={() => setShowGuestBlockModal(false)}
                >
                  {t.backToGuestBtn}
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Chat Drawer */}
        {showChat && (
          <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-background border-l border-border-active shadow-2xl z-[90] flex flex-col animate-slide-left font-sans">
            <div className="flex items-center justify-between p-4 border-b border-border-dim bg-surface">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm">{lang === 'en' ? 'Team Chat' : 'Chat Nhóm'}</h3>
                  <p className="text-[10px] text-text-secondary">{lang === 'en' ? 'Project isolated environment' : 'Môi trường dự án biệt lập'}</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-surface-hover transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-2 opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                  <p className="text-xs">{lang === 'en' ? 'No messages yet.' : 'Chưa có tin nhắn nào.'}</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.userId === user?.id;
                  const showAvatar = idx === 0 || messages[idx-1].userId !== msg.userId;
                  return (
                    <div key={msg.id} className={`flex gap-2 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                      {!isMe && showAvatar ? (
                        <Avatar src={msg.userAvatar} className="w-6 h-6 shrink-0 mt-1" />
                      ) : !isMe ? (
                        <div className="w-6 h-6 shrink-0" />
                      ) : null}
                      <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMe && showAvatar && <span className="text-[9px] font-bold text-text-muted px-1">{msg.userName}</span>}
                        <div className={`px-3 py-2 rounded-2xl text-xs break-words ${isMe ? 'bg-accent-primary text-black rounded-tr-sm' : 'bg-surface border border-border-dim text-text-primary rounded-tl-sm'}`}>
                          {msg.message}
                        </div>
                        <span className="text-[8px] text-text-muted px-1">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            <div className="p-3 bg-surface border-t border-border-dim">
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!chatInput.trim() || !activeProjectId) return;
                  try {
                    await sendMessage(activeProjectId, chatInput);
                    addNotification(
                      lang === 'en' ? `💬 [${activeProject?.name || 'Chat'}] New Message` : `💬 [${activeProject?.name || 'Chat'}] Tin nhắn mới`,
                      `${user?.fullName || 'Thành viên'}: "${chatInput.slice(0, 40)}${chatInput.length > 40 ? '...' : ''}"`,
                      'task'
                    );
                    setChatInput('');
                  } catch (err) {
                    addToast('Send failed', 'error');
                  }
                }}
                className="flex items-center gap-2"
              >
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={lang === 'en' ? 'Type a message...' : 'Nhập tin nhắn...'}
                  className="flex-1 bg-background border border-border-dim rounded-full px-4 py-2 text-xs focus:outline-none focus:border-accent-primary text-text-primary"
                />
                <button type="submit" disabled={!chatInput.trim()} className="p-2 bg-accent-primary text-black rounded-full disabled:opacity-50 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Focalboard Card Inspector Modal */}
        {selectedTaskForDetail && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in font-sans">
            <div className="w-full max-w-2xl bg-surface border border-border-active rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border-dim pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-background border border-border-dim rounded-md text-text-muted">
                        {selectedTaskForDetail.projectName}
                      </span>
                      <Badge variant="info" className="text-[9px]">Focalboard Card</Badge>
                    </div>
                    <h3 className="text-lg font-black text-text-primary font-display mt-0.5">
                      {selectedTaskForDetail.title}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTaskForDetail(null)} 
                  className="p-2 text-text-muted hover:text-white rounded-full hover:bg-surface-hover transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-background/50 p-4 rounded-2xl border border-border-dim text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Status</span>
                  <Badge variant="default" className="font-bold">{selectedTaskForDetail.status}</Badge>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Priority</span>
                  <span className={`font-bold ${
                    selectedTaskForDetail.priority === 'High' ? 'text-red-400' :
                    selectedTaskForDetail.priority === 'Medium' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {selectedTaskForDetail.priority || 'Medium'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Due Date</span>
                  <span className="font-mono text-text-primary">{selectedTaskForDetail.dueDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Assignee</span>
                  <span className="text-text-primary font-medium">{selectedTaskForDetail.assignedTo || 'Unassigned'}</span>
                </div>
              </div>

              {/* Reminder Section */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-text-primary">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Bell className="w-4 h-4" />
                    {lang === 'en' ? 'Task Reminder Notification' : 'Lịch nhắc nhở công việc'}
                  </span>
                  {detailReminder && (
                    <button onClick={() => setDetailReminder('')} className="text-[10px] text-red-400 hover:underline">
                      {lang === 'en' ? 'Clear' : 'Xóa lời nhắc'}
                    </button>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={detailReminder}
                    onChange={(e) => setDetailReminder(e.target.value)}
                    className="flex-1 bg-background border border-border-dim rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-mono cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
                      setDetailReminder(tomorrow);
                      addToast(lang === 'en' ? 'Set reminder for tomorrow!' : 'Đã đặt nhắc nhở vào ngày mai!', 'info');
                    }}
                    className="text-xs shrink-0"
                  >
                    +24h
                  </Button>
                </div>
              </div>

              {/* Markdown / Notes Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-accent-primary" />
                  {lang === 'en' ? 'Focalboard Notes & Acceptance Criteria' : 'Ghi chú & Tiêu chí hoàn thành (Focalboard Note)'}
                </label>
                <textarea
                  value={detailNotes}
                  onChange={(e) => setDetailNotes(e.target.value)}
                  rows={4}
                  placeholder={lang === 'en' ? 'Write detailed specification, checklists, or markdown notes...' : 'Viết chi tiết đầu ra, danh sách công việc nhỏ hoặc ghi chú...'}
                  className="w-full bg-background border border-border-dim rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition placeholder-text-muted leading-relaxed font-mono"
                />
              </div>

              {/* Attachments & Images Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-emerald-400" />
                  {lang === 'en' ? 'Attached Files & Images' : 'Tệp tin & Hình ảnh đính kèm'}
                </label>

                {/* List of existing attachments */}
                {selectedTaskForDetail.attachments && selectedTaskForDetail.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTaskForDetail.attachments.map((att) => (
                      <div key={att.id} className="bg-background border border-border-dim rounded-xl p-2.5 flex items-center justify-between gap-3 group relative overflow-hidden">
                        <div className="flex items-center gap-2.5 truncate">
                          {att.type === 'image' ? (
                            <img src={att.url} alt={att.name} className="w-10 h-10 rounded-lg object-cover bg-surface shrink-0 border border-border-dim" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-text-secondary shrink-0 border border-border-dim font-bold text-[10px]">
                              FILE
                            </div>
                          )}
                          <div className="truncate">
                            <a href={att.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-text-primary hover:text-accent-primary transition truncate block">
                              {att.name}
                            </a>
                            <span className="text-[9px] text-text-muted uppercase font-mono">{att.type}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const remaining = (selectedTaskForDetail.attachments || []).filter(a => a.id !== att.id);
                            const upd = { ...selectedTaskForDetail, attachments: remaining };
                            setSelectedTaskForDetail(upd);
                            updateTask(selectedTaskForDetail.id, { attachments: remaining });
                            addToast('Removed attachment', 'info');
                          }}
                          className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-surface-hover transition cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 border border-dashed border-border-dim rounded-xl text-center text-text-muted text-xs">
                    {lang === 'en' ? 'No attachments yet.' : 'Chưa có tệp hay hình ảnh nào.'}
                  </div>
                )}

                {/* Add new attachment inputs */}
                <div className="bg-background p-3 rounded-xl border border-border-dim space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                    {lang === 'en' ? '+ Attach Image URL or Document' : '+ Đính kèm hình ảnh hoặc URL tài liệu'}
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder={lang === 'en' ? 'File Name (e.g. Architecture Diagram)' : 'Tên tệp (vd: Sơ đồ kiến trúc)'}
                      value={detailNewAttachmentName}
                      onChange={(e) => setDetailNewAttachmentName(e.target.value)}
                      className="sm:w-1/3 bg-surface border border-border-dim rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                    />
                    <input
                      type="text"
                      placeholder={lang === 'en' ? 'Image/File URL (https://...)' : 'URL Hình ảnh/Tệp tin (https://...)'}
                      value={detailNewAttachmentUrl}
                      onChange={(e) => setDetailNewAttachmentUrl(e.target.value)}
                      className="flex-1 bg-surface border border-border-dim rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-mono"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (!selectedTaskForDetail || !detailNewAttachmentUrl.trim()) return;
                        const newAtt = {
                          id: `att_${Date.now()}`,
                          name: detailNewAttachmentName.trim() || 'Attachment',
                          url: detailNewAttachmentUrl.trim(),
                          type: (detailNewAttachmentUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || detailNewAttachmentUrl.includes('image')) ? 'image' : 'file'
                        };
                        const updatedAttachments = [...(selectedTaskForDetail.attachments || []), newAtt];
                        const updatedTask = { ...selectedTaskForDetail, attachments: updatedAttachments };
                        setSelectedTaskForDetail(updatedTask);
                        updateTask(selectedTaskForDetail.id, { attachments: updatedAttachments });
                        setDetailNewAttachmentUrl('');
                        setDetailNewAttachmentName('');
                        addToast(lang === 'en' ? 'Attachment added!' : 'Đã đính kèm tệp tin!', 'success');
                        addNotification(
                          lang === 'en' ? `📎 [${selectedTaskForDetail.projectName}] Attachment Added` : `📎 [${selectedTaskForDetail.projectName}] Tệp đính kèm mới`,
                          `${user?.fullName || 'Thành viên'} đã đính kèm tệp "${newAtt.name}" vào công việc "${selectedTaskForDetail.title}".`,
                          'task'
                        );
                      }}
                      disabled={!detailNewAttachmentUrl.trim()}
                      className="text-xs py-1.5 px-4 shrink-0"
                    >
                      {lang === 'en' ? 'Add' : 'Thêm'}
                    </Button>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDetailNewAttachmentName('UI Design Preview');
                        setDetailNewAttachmentUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80');
                      }}
                      className="text-[10px] text-accent-primary hover:underline font-mono"
                    >
                      [+ Sample Image URL]
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailNewAttachmentName('Project Specification Doc');
                        setDetailNewAttachmentUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
                      }}
                      className="text-[10px] text-emerald-400 hover:underline font-mono"
                    >
                      [+ Sample PDF URL]
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-dim">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTaskForDetail(null)}
                >
                  {t.btnCancel}
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedTaskForDetail) return;
                    try {
                      await updateTask(selectedTaskForDetail.id, {
                        notes: detailNotes,
                        reminderDate: detailReminder,
                        attachments: selectedTaskForDetail.attachments || [],
                      });
                      if (detailReminder) {
                        addNotification(
                          lang === 'en' ? '⏰ Reminder Saved' : '⏰ Đã lưu lịch nhắc nhở',
                          `Reminder set for "${selectedTaskForDetail.title}" at ${detailReminder}.`,
                          'task'
                        );
                      }
                      if (detailNotes !== (selectedTaskForDetail.notes || '')) {
                        addNotification(
                          lang === 'en' ? `📝 [${selectedTaskForDetail.projectName}] Note Updated` : `📝 [${selectedTaskForDetail.projectName}] Cập nhật ghi chú`,
                          `${user?.fullName || 'Thành viên'} đã cập nhật ghi chú cho công việc "${selectedTaskForDetail.title}".`,
                          'task'
                        );
                      }
                      addToast(lang === 'en' ? 'Task details updated!' : 'Đã cập nhật chi tiết công việc!', 'success');
                      addLog(`Updated Focalboard details for card '${selectedTaskForDetail.title}'`, 'TeamFlow Pro', user?.fullName || '');
                      setSelectedTaskForDetail(null);
                    } catch (err) {
                      addToast(lang === 'en' ? 'Failed to update task' : 'Cập nhật thất bại', 'error');
                    }
                  }}
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  {lang === 'en' ? 'Save Focalboard Card' : 'Lưu Chi Tiết Card'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
};
