'use client';

import { X, Calendar, AlertCircle, Clock, CheckCircle2, MessageSquare, Paperclip, User, AlertTriangle } from 'lucide-react';
import { Task, Priority } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const priorityConfig = {
  urgent: { color: 'bg-red-500', label: 'Urgent', ring: 'ring-red-500' },
  high: { color: 'bg-orange-500', label: 'High', ring: 'ring-orange-500' },
  medium: { color: 'bg-yellow-500', label: 'Medium', ring: 'ring-yellow-500' },
  low: { color: 'bg-green-500', label: 'Low', ring: 'ring-green-500' },
};

export default function TaskModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const priority = priorityConfig[task.priority];
  
  // Calculate due date status
  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    const due = new Date(task.dueDate);
    const now = new Date();
    const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (task.status === 'done') return { status: 'completed', text: 'Completed', color: 'text-green-500' };
    if (daysUntil < 0) return { status: 'overdue', text: `${Math.abs(daysUntil)} days overdue`, color: 'text-red-500' };
    if (daysUntil === 0) return { status: 'today', text: 'Due today', color: 'text-orange-500' };
    if (daysUntil <= 3) return { status: 'soon', text: `${daysUntil} days left`, color: 'text-yellow-500' };
    return { status: 'ok', text: `${daysUntil} days left`, color: 'text-slate-400' };
  };

  const dueDateStatus = getDueDateStatus();
  const completedChecklist = task.checklist.filter(c => c.completed).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-card-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className={`sticky top-0 bg-card border-b border-card-border p-6 ${priority.ring}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-3 h-3 rounded-full ${priority.color}`} />
                  <span className="text-xs text-muted uppercase tracking-wider font-semibold">
                    {priority.label} Priority
                  </span>
                  {task.status === 'in-progress' && (
                    <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                      In Progress
                    </span>
                  )}
                  {dueDateStatus?.status === 'overdue' && (
                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Overdue
                    </span>
                  )}
                  {dueDateStatus?.status === 'today' && (
                    <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Due Today
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-foreground leading-tight">
                  {task.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted hover:text-foreground transition-colors p-1 hover:bg-card-border rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-foreground leading-relaxed">
                {task.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
                  Progress
                </h3>
                <span className="text-lg font-bold text-primary">{task.progress}%</span>
              </div>
              <div className="w-full bg-card-border rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-3 rounded-full ${
                    task.progress === 100 ? 'bg-green-500' : 'bg-primary'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Due Date & Timeline */}
            {task.dueDate && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card-border/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="uppercase tracking-wider">Due Date</span>
                  </div>
                  <p className="text-foreground font-semibold">
                    {new Date(task.dueDate).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {dueDateStatus && (
                    <p className={`text-sm mt-2 font-medium ${dueDateStatus.color}`}>
                      {dueDateStatus.text}
                    </p>
                  )}
                </div>

                <div className="bg-card-border/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="uppercase tracking-wider">Timeline</span>
                  </div>
                  <p className="text-foreground font-semibold">
                    Created: {new Date(task.createdAt).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  {task.completedDate && (
                    <p className="text-green-400 text-sm mt-1">
                      Completed: {new Date(task.completedDate).toLocaleDateString('en-GB', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Checklist */}
            {task.checklist.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                  Checklist ({completedChecklist}/{task.checklist.length} complete)
                </h3>
                <div className="space-y-2">
                  {task.checklist.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        item.completed
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-card-border/50 border-card-border'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          item.completed ? 'text-green-500' : 'text-muted'
                        }`}
                      />
                      <span className={item.completed ? 'line-through text-muted' : 'text-foreground'}>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card-border/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted text-sm mb-1">
                  <User className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Assignee</span>
                </div>
                <p className="text-foreground font-semibold capitalize">{task.assignee}</p>
              </div>

              <div className="bg-card-border/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted text-sm mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Dependencies</span>
                </div>
                <p className="text-foreground font-semibold">{task.dependencies.length}</p>
              </div>

              <div className="bg-card-border/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted text-sm mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Comments</span>
                </div>
                <p className="text-foreground font-semibold">
                  {task.comments ? task.comments.length : 0}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-card-border">
              <button
                onClick={onClose}
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
              <button className="flex-1 bg-card-border hover:bg-card-border/80 text-foreground font-semibold py-3 px-6 rounded-lg transition-colors">
                Edit Task
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
