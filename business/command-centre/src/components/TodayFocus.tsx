'use client';

import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react';
import { Task } from '@/types';

export default function TodayFocus({ 
  tasks, 
  onSelectTask 
}: { 
  tasks: Task[]; 
  onSelectTask: (task: Task) => void; 
}) {
  // Smart queue algorithm:
  // 1. Urgent & In Progress
  // 2. High priority & due soon (within 3 days)
  // 3. In Progress tasks not yet completed
  // 4. High priority Todo items
  
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const smartQueue = tasks.filter(task => {
    // Only show active tasks (not done)
    if (task.status === 'done') return false;
    
    // Priority 1: Urgent + In Progress
    if (task.priority === 'urgent' && task.status === 'in-progress') return true;
    
    // Priority 2: High priority + due within 3 days
    if (task.priority === 'high' && task.dueDate) {
      const due = new Date(task.dueDate);
      if (due <= threeDaysFromNow) return true;
    }
    
    // Priority 3: Any in-progress task with < 50% progress
    if (task.status === 'in-progress' && task.progress < 50) return true;
    
    // Priority 4: High/Medium priority Todo
    if (['high', 'medium'].includes(task.priority) && task.status === 'todo') return true;
    
    return false;
  }).sort((a, b) => {
    // Sort by urgency
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { 'in-progress': 0, 'todo': 1, 'blocked': 2, 'backlog': 3, 'review': 4 };
    
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    // Due date sorting
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    return 0;
  });

  if (smartQueue.length === 0) {
    return (
      <div className="bg-card/50 border border-card-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Today's Focus
        </h2>
        <p className="text-muted text-sm">No priority tasks ready. Great work!</p>
      </div>
    );
  }

  return (
    <div className="bg-card/50 border border-card-border rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        Today's Focus ({smartQueue.length})
      </h2>
      
      <div className="space-y-3">
        {smartQueue.map((task, index) => {
          const due = task.dueDate ? new Date(task.dueDate) : null;
          const isUrgent = task.priority === 'urgent';
          const isBlocked = task.status === 'blocked';
          const dueText = due ? due.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectTask(task)}
              className="bg-card hover:bg-card-border/50 border border-card-border rounded-lg p-4 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isUrgent && <span className="text-xs font-bold text-danger">🔥 URGENT</span>}
                    {isBlocked && <span className="text-xs font-bold text-danger">🚫 BLOCKED</span>}
                    {due && <span className="text-xs text-muted">Due {dueText}</span>}
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-1">{task.title}</h3>
                  
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="capitalize">{task.status.replace('-', ' ')}</span>
                    <span>•</span>
                    <span className="capitalize">{task.priority}</span>
                    <span>•</span>
                    <span>{task.progress}% complete</span>
                  </div>
                </div>
                
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0 ml-2" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
