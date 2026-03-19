'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Plus, X, Edit2, Save } from 'lucide-react';
import { Task } from '@/types';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  priority: Task['priority'];
  status: Task['status'];
  assignee: Task['assignee'];
  projectId: string;
  phaseId: string;
  estimate: number;
  checklist: Task['checklist'];
  subtasks: Task['subtasks'];
  repeatInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  customInterval?: number; // days
  createdAt: string;
}

const defaultTemplates: TaskTemplate[] = [
  {
    id: 'template-1',
    name: 'Weekly HMRC Auto-Call Test',
    description: 'Run automated HMRC call test suite',
    priority: 'high',
    status: 'backlog',
    assignee: 'dawn',
    projectId: 'proj-1',
    phaseId: 'phase-6',
    estimate: 120,
    checklist: [
      { id: 'chk-1', title: 'Verify UCM6308 connection', completed: false },
      { id: 'chk-2', title: 'Test ElevenLabs voice agent', completed: false },
      { id: 'chk-3', title: 'Check hold detection', completed: false },
    ],
    subtasks: [
      { id: 'sub-1', title: 'Test Corporation Tax line', completed: false },
      { id: 'sub-2', title: 'Test VAT line', completed: false },
      { id: 'sub-3', title: 'Test PAYE line', completed: false },
    ],
    repeatInterval: 'weekly',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'template-2',
    name: 'Daily Health Check',
    description: 'Morning routine check-in',
    priority: 'medium',
    status: 'todo',
    assignee: 'human',
    projectId: 'proj-health',
    phaseId: '',
    estimate: 15,
    checklist: [
      { id: 'chk-1', title: 'Check weight', completed: false },
      { id: 'chk-2', title: 'Log meals', completed: false },
      { id: 'chk-3', title: 'Exercise completed', completed: false },
    ],
    subtasks: [],
    repeatInterval: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'template-3',
    name: 'Piano Practice Session',
    description: 'Ridley Academy practice routine',
    priority: 'medium',
    status: 'todo',
    assignee: 'human',
    projectId: 'proj-piano',
    phaseId: '',
    estimate: 30,
    checklist: [
      { id: 'chk-1', title: 'Complete daily exercises', completed: false },
      { id: 'chk-2', title: 'Practice songs', completed: false },
      { id: 'chk-3', title: 'Record progress', completed: false },
    ],
    subtasks: [],
    repeatInterval: 'daily',
    createdAt: new Date().toISOString(),
  },
];

export default function TemplateManager({ 
  onUseTemplate,
  onSaveTemplate
}: { 
  onUseTemplate: (template: TaskTemplate) => void;
  onSaveTemplate: (template: Partial<TaskTemplate>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [templates, setTemplates] = useState<TaskTemplate[]>(defaultTemplates);
  
  // New template form state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplatePriority, setNewTemplatePriority] = useState<Task['priority']>('medium');
  const [newTemplateRepeat, setNewTemplateRepeat] = useState<TaskTemplate['repeatInterval']>('none');

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;

    const template: Partial<TaskTemplate> = {
      name: newTemplateName.trim(),
      description: newTemplateDescription,
      priority: newTemplatePriority,
      repeatInterval: newTemplateRepeat !== 'none' ? newTemplateRepeat : undefined,
      checklist: [],
      subtasks: [],
      projectId: 'proj-1',
      phaseId: '',
      assignee: 'dawn',
      status: 'backlog',
      estimate: 60,
    };

    onSaveTemplate(template);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplatePriority('medium');
    setNewTemplateRepeat('none');
    setIsCreating(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <Copy className="w-4 h-4" />
        <span>Task Templates ({templates.length})</span>
      </button>
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
        <h4 className="text-sm font-semibold">Task Templates</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreating(true)}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            New Template
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create Template Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-border/50 border border-card-border rounded-lg p-4 mb-4"
        >
          <h5 className="font-semibold text-sm mb-3">Create New Template</h5>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                placeholder="e.g., Weekly Status Report"
                className="w-full bg-card-border/50 border border-card-border rounded px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                value={newTemplateDescription}
                onChange={e => setNewTemplateDescription(e.target.value)}
                placeholder="Task description..."
                rows={2}
                className="w-full bg-card-border/50 border border-card-border rounded px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  value={newTemplatePriority}
                  onChange={e => setNewTemplatePriority(e.target.value as Task['priority'])}
                  className="w-full bg-card-border/50 border border-card-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Repeat Interval
                </label>
                <select
                  value={newTemplateRepeat}
                  onChange={e => setNewTemplateRepeat(e.target.value as TaskTemplate['repeatInterval'])}
                  className="w-full bg-card-border/50 border border-card-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="none">No Repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-card-border hover:bg-card-border/80 text-foreground text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplateName.trim()}
                className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                <Save className="w-3 h-3 inline mr-1" />
                Save Template
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Template List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {templates.map(template => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="group bg-card-border/50 hover:bg-card-border/80 border border-card-border hover:border-primary rounded-lg p-3 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-semibold text-sm mb-1">{template.name}</h5>
                  <p className="text-xs text-muted mb-2 line-clamp-2">{template.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      {template.repeatInterval && (
                        <span className="inline-flex items-center gap-1 bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          <Copy className="w-2 h-2" />
                          {template.repeatInterval === 'daily' && 'Daily'}
                          {template.repeatInterval === 'weekly' && 'Weekly'}
                          {template.repeatInterval === 'monthly' && 'Monthly'}
                          {template.repeatInterval === 'yearly' && 'Yearly'}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted">
                      {template.checklist.length} checklist, {template.subtasks?.length || 0} subtasks
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onUseTemplate(template)}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  Use
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
