'use client';

import { useState } from 'react';
import { X, Plus, Calendar, User, AlertTriangle, GitCommit } from 'lucide-react';
import { Task, Priority, Status } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskCreationForm({ 
  isOpen, 
  onClose, 
  onCreateTask 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreateTask: (task: Partial<Task>) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('backlog');
  const [assignee, setAssignee] = useState<'dawn' | 'human' | 'both'>('dawn');
  const [dueDate, setDueDate] = useState('');
  const [phaseId, setPhaseId] = useState('');

  const phases = [
    { id: 'phase-1', name: 'Phase 1: UCM6308 API Integration' },
    { id: 'phase-2', name: 'Phase 2: ElevenLabs Voice Agent' },
    { id: 'phase-3', name: 'Phase 3: Hold Detection' },
    { id: 'phase-4', name: 'Phase 4: Control Centre UI' },
    { id: 'phase-5', name: 'Phase 5: Database Integration' },
    { id: 'phase-6', name: 'Phase 6: Testing & Refinement' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      return; // Validation
    }

    const newTask: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assignee,
      dueDate: dueDate || undefined,
      phaseId: phaseId || undefined,
      progress: 0,
      checklist: [],
      dependencies: [],
      comments: [],
      attachments: [],
    };

    onCreateTask(newTask);
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('backlog');
    setAssignee('dawn');
    setDueDate('');
    setPhaseId('');
    onClose();
  };

  if (!isOpen) return null;

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
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-card-border p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create New Task</h2>
              <button
                onClick={onClose}
                className="text-muted hover:text-foreground transition-colors p-1 hover:bg-card-border rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-muted uppercase tracking-wider mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Implement payment processing"
                className="w-full bg-card-border/50 border border-card-border rounded-lg px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-muted uppercase tracking-wider mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed description of what needs to be done..."
                rows={4}
                className="w-full bg-card-border/50 border border-card-border rounded-lg px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors resize-none"
                required
              />
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted uppercase tracking-wider mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full bg-card-border/50 border border-card-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as Status)}
                  className="w-full bg-card-border/50 border border-card-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {/* Assignee & Phase */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted uppercase tracking-wider mb-2">
                  Assignee
                </label>
                <select
                  value={assignee}
                  onChange={e => setAssignee(e.target.value as 'dawn' | 'human' | 'both')}
                  className="w-full bg-card-border/50 border border-card-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="dawn">Dawn (AI)</option>
                  <option value="human">Human</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted uppercase tracking-wider mb-2">
                  Phase
                </label>
                <select
                  value={phaseId}
                  onChange={e => setPhaseId(e.target.value)}
                  className="w-full bg-card-border/50 border border-card-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select Phase</option>
                  {phases.map(phase => (
                    <option key={phase.id} value={phase.id}>
                      {phase.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-muted uppercase tracking-wider mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-card-border/50 border border-card-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-card-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-card-border hover:bg-card-border/80 text-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Task</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
