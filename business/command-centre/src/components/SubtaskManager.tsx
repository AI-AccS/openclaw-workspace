'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Subtask, Task } from '@/types';

export default function SubtaskManager({ 
  task, 
  onUpdateSubtasks 
}: { 
  task: Task; 
  onUpdateSubtasks: (task: Task, subtasks: Subtask[]) => void; 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  const completedCount = task.subtasks?.filter(s => s.completed).length || 0;
  const totalCount = task.subtasks?.length || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    const newSubtask: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      dueDate: undefined,
    };
    
    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    onUpdateSubtasks(task, updatedSubtasks);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map(sub => ({
      ...sub,
      completed: sub.id === subtaskId ? !sub.completed : sub.completed,
    }));
    onUpdateSubtasks(task, updatedSubtasks);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).filter(sub => sub.id !== subtaskId);
    onUpdateSubtasks(task, updatedSubtasks);
  };

  if (!isExpanded) {
    return (
      <div className="mt-3 pt-3 border-t border-card-border">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-between w-full text-sm text-muted hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{totalCount > 0 ? `${completedCount}/${totalCount} subtasks` : 'Add subtasks'}</span>
          </div>
          {totalCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs">{progress}%</span>
              <div className="w-16 bg-card-border rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 pt-3 border-t border-card-border"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Subtasks</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{completedCount}/{totalCount} done</span>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtask List */}
      <div className="space-y-2 mb-3">
        <AnimatePresence>
          {(task.subtasks || []).map(subtask => (
            <motion.div
              key={subtask.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-start gap-2 group"
            >
              <button
                onClick={() => handleToggleSubtask(subtask.id)}
                className={`mt-0.5 transition-colors ${
                  subtask.completed 
                    ? 'text-success' 
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {subtask.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>
              
              <span className={`flex-1 text-sm ${
                subtask.completed ? 'line-through text-muted' : 'text-foreground'
              }`}>
                {subtask.title}
              </span>
              
              <button
                onClick={() => handleDeleteSubtask(subtask.id)}
                className="text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Subtask Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={e => setNewSubtaskTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
          placeholder="Add a subtask..."
          className="flex-1 bg-card-border/50 border border-card-border rounded px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={handleAddSubtask}
          disabled={!newSubtaskTitle.trim()}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-3 py-2 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted">Subtask Progress</span>
            <span className="text-xs text-muted">{progress}%</span>
          </div>
          <div className="w-full bg-card-border rounded-full h-1.5 overflow-hidden">
            <motion.div
              className={`h-1.5 rounded-full ${
                progress === 100 ? 'bg-success' : 'bg-primary'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
