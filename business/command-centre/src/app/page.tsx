'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { sampleData } from '@/data/sampleData';
import { Task, Priority, Status } from '@/types';
import { CircleAlert, CheckCircle2, Clock, Flag, GitCommit, Lock, MessageSquare, Paperclip, User } from 'lucide-react';

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
function SortableTaskCard({ task }: { task: Task }) {
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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card border border-card-border rounded-lg p-4 cursor grab hover:border-primary transition-all duration-200 ${
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
        {task.status === 'done' && (
          <CheckCircle2 className="w-4 h-4 text-success" />
        )}
        {task.status === 'blocked' && (
          <Lock className="w-4 h-4 text-danger" />
        )}
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
          {/* Assignee */}
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="capitalize">{task.assignee}</span>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}

          {/* Dependencies */}
          {task.dependencies.length > 0 && (
            <div className="flex items-center gap-1">
              <GitCommit className="w-3 h-3" />
              <span>{task.dependencies.length} deps</span>
            </div>
          )}
        </div>

        {/* Actions */}
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
  return <SortableTaskCard task={task} />;
}

// Main Page Component
export default function CommandCentre() {
  const [tasks, setTasks] = useState<Task[]>(sampleData.tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (event: any) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
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
      // Update task status already done in onDragOver
      // Here we could add analytics or notifications
    }

    setActiveTask(null);
  };

  // Group tasks by status
  const getTasksByStatus = (status: Status) => {
    return tasks.filter(task => task.status === status);
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const completionRate = Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
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

            {/* Stats */}
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

          {/* Overall Progress Bar */}
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

      {/* Kanban Board */}
      <main className="max-w-7xl mx-auto px-6 py-6">
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
                {/* Column Header */}
                <div className={`flex items-center justify-between pb-3 border-b-2 ${column.color} mb-3`}>
                  <h2 className="font-semibold text-sm uppercase tracking-wider">
                    {column.label}
                  </h2>
                  <span className="bg-card-border text-muted text-xs px-2 py-1 rounded-full">
                    {getTasksByStatus(column.id as Status).length}
                  </span>
                </div>

                {/* Tasks Container */}
                <div className="flex-1 space-y-3">
                  <SortableContext
                    items={getTasksByStatus(column.id as Status).map(t => t.id)}
                  >
                    <AnimatePresence>
                      {getTasksByStatus(column.id as Status).map(task => (
                        <SortableTaskCard key={task.id} task={task} />
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
          <p className="mt-1">Powered by Dawn • Command Centre v0.1</p>
        </div>
      </footer>
    </div>
  );
}
