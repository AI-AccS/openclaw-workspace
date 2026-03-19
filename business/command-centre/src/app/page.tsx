'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { sampleData } from '@/data/sampleData';
import { Task, Priority, Status } from '@/types';
import { CircleAlert, CheckCircle2, Clock, Flag, GitCommit, Lock, MessageSquare, Paperclip, User, Plus } from 'lucide-react';
import TaskModal from '@/components/TaskModal';
import FilterBar from '@/components/FilterBar';
import TaskCreationForm from '@/components/TaskCreationForm';

// Priority colors and labels
const priorityConfig = {
  urgent: { color: 'bg-red-500', label: 'Urgent', icon: Flag },
  high: { color: 'bg-orange-500', label: 'High', icon: Flag },
  medium: { color: 'bg-yellow-500', label: 'Medium', icon: Flag },
  low: { color: 'bg-green-500', label: 'Low', icon: Flag },
};

// Status columns configuration
const statusColumns = [
  { id: 'backlog', label: 'Backlog', color: 'border-slate-500' },
  { id: 'todo', label: 'Todo', color: 'border-blue-500' },
  { id: 'in-progress', label: 'In Progress', color: 'border-purple-500' },
  { id: 'blocked', label: 'Blocked', color: 'border-red-500' },
  { id: 'review', label: 'Review', color: 'border-orange-500' },
  { id: 'done', label: 'Done', color: 'border-green-500' },
];

// Sortable Task Card Component
function SortableTaskCard({ task, onCardClick }: { task: Task; onCardClick: (task: Task) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const PriorityIcon = priorityConfig[task.priority].icon;

  // Due date warning
  const getDueDateWarning = () => {
    if (!task.dueDate || task.status === 'done') return null;
    const due = new Date(task.dueDate);
    const now = new Date();
    const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { icon: '🔴', text: 'OVERDUE' };
    if (daysUntil === 0) return { icon: '🟠', text: 'DUE TODAY' };
    if (daysUntil <= 3) return { icon: '🟡', text: `${daysUntil}d` };
    return null;
  };

  const dueWarning = getDueDateWarning();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onCardClick(task)}
      className={`bg-card border border-card-border rounded-lg p-4 cursor-pointer hover:border-primary transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105 shadow-2xl' : ''
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${priorityConfig[task.priority].color}`} />
          <span className="text-xs text-muted uppercase tracking-wider">
            {priorityConfig[task.priority].label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {dueWarning && (
            <span className="text-xs font-bold">{dueWarning.icon} {dueWarning.text}</span>
          )}
          {task.status === 'done' && <CheckCircle2 className="w-4 h-4 text-success" />}
          {task.status === 'blocked' && <Lock className="w-4 h-4 text-danger" />}
        </div>
      </div>

      {/* Task Title */}
      <h3 className="font-semibold text-sm mb-2 leading-tight">
        {task.title}
      </h3>

      {/* Progress Bar */}
      {task.progress < 100 && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted">Progress</span>
            <span className="text-xs text-muted">{task.progress}%</span>
          </div>
          <div className="w-full bg-card-border rounded-full h-1.5 overflow-hidden">
            <motion.div
              className={`h-1.5 rounded-full ${
                task.progress === 100 ? 'bg-success' : 'bg-primary'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Checklist Progress */}
      {task.checklist.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-muted" />
          <span className="text-xs text-muted">
            {task.checklist.filter(c => c.completed).length} / {task.checklist.length} done
          </span>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="mt-3 pt-3 border-t border-card-border flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="capitalize">{task.assignee}</span>
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
          {task.dependencies.length > 0 && (
            <div className="flex items-center gap-1">
              <GitCommit className="w-3 h-3" />
              <span>{task.dependencies.length} deps</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.comments && task.comments.length > 0 && (
            <MessageSquare className="w-3 h-3 hover:text-foreground transition-colors" />
          )}
          {task.attachments && task.attachments.length > 0 && (
            <Paperclip className="w-3 h-3 hover:text-foreground transition-colors" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Drag Overlay Component
function TaskOverlay({ task }: { task: Task | null }) {
  if (!task) return null;
  return <SortableTaskCard task={task} onCardClick={() => {}} />;
}

// Main Page Component
export default function CommandCentre() {
  const [tasks, setTasks] = useState<Task[]>(sampleData.tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    priority: 'all',
    status: 'all',
    assignee: 'all',
  });
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handle new task creation
  const handleCreateTask = (newTask: Partial<Task>) => {
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title || 'New Task',
      description: newTask.description || '',
      projectId: 'proj-1',
      phaseId: newTask.phaseId || '',
      priority: newTask.priority || 'medium',
      status: newTask.status || 'backlog',
      assignee: newTask.assignee || 'dawn',
      progress: 0,
      createdAt: new Date().toISOString(),
      dueDate: newTask.dueDate || undefined,
      updatedAt: new Date().toISOString(),
      checklist: [],
      dependencies: [],
      comments: [],
      attachments: [],
    };
    setTasks(prev => [...prev, task]);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !task.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.assignee !== 'all' && task.assignee !== filters.assignee) return false;
    return true;
  });

  const onDragStart = (event: any) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const onDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const activeStatus = tasks.find(t => t.id === active.id)?.status;
    const overStatus = tasks.find(t => t.id === over.id)?.status;
    if (activeStatus !== overStatus) {
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === active.id) {
            return { ...task, status: overStatus as Status };
          }
          return task;
        })
      );
    }
  };

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      return;
    }
    const activeStatus = tasks.find(t => t.id === active.id)?.status;
    const overStatus = tasks.find(t => t.id === over.id)?.status;
    if (activeStatus !== overStatus) {
      // Status already updated in onDragOver
    }
    setActiveTask(null);
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const getTasksByStatus = (status: Status) => {
    return filteredTasks.filter(task => task.status === status);
  };

  // Calculate stats based on filtered tasks
  const totalTasks = filteredTasks.length;
  const doneTasks = filteredTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress').length;
  const blockedTasks = filteredTasks.filter(t => t.status === 'blocked').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Task Modal */}
      {selectedTask && <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />}

      {/* Header */}
      <header className="border-b border-card-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Command Centre
              </h1>
              <p className="text-sm text-muted mt-1">
                HMRC Auto-Call System • 6 Phases • {completionRate}% Complete
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{inProgressTasks}</div>
                <div className="text-xs text-muted">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{doneTasks}</div>
                <div className="text-xs text-muted">Completed</div>
              </div>
              {blockedTasks > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-danger flex items-center gap-1">
                    {blockedTasks} <CircleAlert className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-muted">Blocked</div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted">Overall Progress</span>
              <span className="text-sm font-semibold">{completionRate}%</span>
            </div>
            <div className="w-full bg-card-border rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-primary to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Task Creation Form */}
        <TaskCreationForm 
          isOpen={isCreateFormOpen} 
          onClose={() => setIsCreateFormOpen(false)} 
          onCreateTask={handleCreateTask}
        />

        {/* Filter Bar */}
        <FilterBar tasks={tasks} onFilterChange={handleFilterChange} activeFilters={filters} />

        {/* Add Task Button */}
        <div className="mb-6">
          <button 
            onClick={() => setIsCreateFormOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Task</span>
          </button>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="grid grid-cols-6 gap-4">
            {statusColumns.map(column => (
              <div key={column.id} className="flex flex-col">
                <div className={`flex items-center justify-between pb-3 border-b-2 ${column.color} mb-3`}>
                  <h2 className="font-semibold text-sm uppercase tracking-wider">
                    {column.label}
                  </h2>
                  <span className="bg-card-border text-muted text-xs px-2 py-1 rounded-full">
                    {getTasksByStatus(column.id as Status).length}
                  </span>
                </div>
                <div className="flex-1 space-y-3">
                  <SortableContext items={getTasksByStatus(column.id as Status).map(t => t.id)}>
                    <AnimatePresence>
                      {getTasksByStatus(column.id as Status).map(task => (
                        <SortableTaskCard key={task.id} task={task} onCardClick={handleCardClick} />
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                  {getTasksByStatus(column.id as Status).length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-card-border rounded-lg">
                      <p className="text-sm text-muted">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DragOverlay>
            <TaskOverlay task={activeTask} />
          </DragOverlay>
        </DndContext>
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border mt-8 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted">
          <p>Last updated: {new Date().toLocaleString('en-GB')}</p>
          <p className="mt-1">Powered by Dawn • Command Centre v0.2 - Phase 2</p>
        </div>
      </footer>
    </div>
  );
}
