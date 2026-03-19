'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Rocket, Plus, Trash2 } from 'lucide-react';
import { Task } from '@/types';

export default function NewIdeasColumn({ 
  ideas, 
  onAddIdea, 
  onDeleteIdea,
  onPromoteToTask
}: { 
  ideas: Task[]; 
  onAddIdea: (idea: Partial<Task>) => void;
  onDeleteIdea: (ideaId: string) => void;
  onPromoteToTask: (idea: Task) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDescription, setNewIdeaDescription] = useState('');

  const handleAddIdea = () => {
    if (!newIdeaTitle.trim()) return;

    const idea: Partial<Task> = {
      title: newIdeaTitle.trim(),
      description: newIdeaDescription.trim(),
      priority: 'low',
      status: 'new-idea',
      assignee: 'both',
      phaseId: '',
      progress: 0,
    };

    onAddIdea(idea);
    setNewIdeaTitle('');
    setNewIdeaDescription('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-sky-500 mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-sky-500" />
          <h2 className="font-semibold text-sm uppercase tracking-wider">
            New Ideas
          </h2>
        </div>
        <span className="bg-card-border text-muted text-xs px-2 py-1 rounded-full">
          {ideas.length}
        </span>
      </div>

      {/* Ideas List */}
      <div className="flex-1 space-y-3 mb-4">
        <AnimatePresence>
          {ideas.map(idea => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-card-border rounded-lg p-4 hover:border-sky-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{idea.title}</h3>
                  {idea.description && (
                    <p className="text-xs text-muted line-clamp-2 mb-2">
                      {idea.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteIdea(idea.id!)}
                  className="text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPromoteToTask(idea)}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Rocket className="w-3 h-3" />
                  Promote to Task
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {ideas.length === 0 && !isAdding && (
          <div className="text-center py-8 border-2 border-dashed border-card-border rounded-lg">
            <Lightbulb className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No ideas yet</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-3 text-primary hover:text-primary-hover text-sm font-semibold transition-colors"
            >
              Add your first idea
            </button>
          </div>
        )}
      </div>

      {/* Add Idea Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-card border border-sky-500 rounded-lg p-4"
        >
          <h4 className="font-semibold text-sm mb-3">Add New Idea</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Idea Title *
              </label>
              <input
                type="text"
                value={newIdeaTitle}
                onChange={e => setNewIdeaTitle(e.target.value)}
                placeholder="e.g., Automated invoice processing"
                className="w-full bg-card-border/50 border border-card-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-sky-500 transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newIdeaDescription}
                onChange={e => setNewIdeaDescription(e.target.value)}
                placeholder="Brief description of the idea..."
                rows={3}
                className="w-full bg-card-border/50 border border-card-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-sky-500 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-card-border hover:bg-card-border/80 text-foreground text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIdea}
                disabled={!newIdeaTitle.trim()}
                className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                Add Idea
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full border-2 border-dashed border-card-border hover:border-sky-500 text-muted hover:text-sky-500 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Idea</span>
        </button>
      )}
    </div>
  );
}
