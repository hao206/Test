import React, { useState, useEffect } from 'react';
import { 
  Flame, ArrowRight, ArrowLeft, CheckCircle2, Plus
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
  handleNextStatus: (id: string, st: TaskStatus) => void;
  handleDeleteTask: (id: string) => void;
  colValue: TaskStatus;
}

const DraggableTaskCard: React.FC<DraggableCardProps> = ({
  task,
  accentColor,
  lang,
  handleNextStatus,
  handleDeleteTask,
  colValue
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-surface border border-border-dim rounded-xl p-3 space-y-2 hover:border-border-active transition-all shadow-sm group select-none relative"
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

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

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
    }, 15000);
    return () => clearInterval(interval);
  }, [activeProjectId]);
  const user = useAuthStore((state) => state.user);
  const addLog = useAuditStore((state) => state.addLog);
  const addToast = useToastStore((state) => state.addToast);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const addTask = useTaskStore((state) => state.addTask);
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
        {/* Metrics and Burn Down Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface border border-border-dim rounded-[32px] p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <Badge variant="info">{lang === 'en' ? 'Active Sprint Tracker' : 'Theo dõi Sprint Hoạt động'}</Badge>
                <span className="text-[10px] text-text-muted font-mono">{lang === 'en' ? 'End Date: June 20, 2026' : 'Hạn sprint: 20 Tháng 6, 2026'}</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary font-display">{t.appName} {lang === 'en' ? 'Sprint Progress' : 'Tiến độ Sprint'}</h3>
              <p className="text-text-secondary text-xs">{lang === 'en' ? 'Tracking graduation team contribution goals across Agile sprints milestones.' : 'Theo dõi mục tiêu đóng góp của nhóm khoa học qua các cột mốc Agile sprint.'}</p>
            </div>

            <div className="space-y-3 mt-6 lg:mt-0 relative z-10">
              <div className="flex justify-between items-center text-xs text-text-secondary">
                <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-yellow-500" /> {t.tfBurnLabel}</span>
                <span className="font-bold text-text-primary">{sprintBurnProgress}% Done ({completedTasks}/{totalTasks} tasks)</span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden border border-border-dim">
                <div 
                  className="h-full rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(204,255,0,0.5)]"
                  style={{ width: `${sprintBurnProgress}%`, backgroundColor: accentColor }}
                />
              </div>
            </div>
            <div className="absolute -right-12 -bottom-10 w-48 h-48 blur-[80px] opacity-10 rounded-full" style={{ backgroundColor: accentColor }}></div>
          </div>

          {/* Quick controls panel */}
          <div className="bg-surface border border-border-dim rounded-[32px] p-6 flex flex-col justify-between">
            <div className="space-y-1">
              <h4 className="text-xs text-text-secondary uppercase font-bold tracking-wider font-mono">{lang === 'en' ? 'Agile Action Board' : 'Bảng Hoạt Động Agile'}</h4>
              <p className="text-[11px] text-text-muted">{lang === 'en' ? 'Fast tracking utility tools designed to assign cards instantly.' : 'Các công cụ tiện ích giúp phân công thẻ công việc nhanh chóng.'}</p>
            </div>
            
            <Button 
              onClick={() => {
                if (activeUserRole === 'Guest') {
                  setShowGuestBlockModal(true);
                } else {
                  setShowAddTask(true);
                }
              }}
              className="w-full mt-4"
            >
              <Plus className="w-4 h-4 mr-1" /> {t.btnAddTask}
            </Button>
          </div>
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
      </div>
    </DndContext>
  );
};
