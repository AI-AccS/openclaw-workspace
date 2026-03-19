'use client';

import { motion } from 'framer-motion';
import { Target, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { Project } from '@/types';

export default function GoalsHierarchy({ 
  projects 
}: { 
  projects: Project[]; 
}) {
  // Calculate overall progress across all projects
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.progress === 100).length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  
  const overallProgress = totalProjects > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
    : 0;

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="bg-card/50 border border-card-border rounded-xl p-6 mb-6">
      {/* Goals Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Goals Overview
        </h2>
        
        <div className="flex items-center gap-4 text-sm text-muted">
          <span>{activeProjects} Active</span>
          <span>•</span>
          <span>{completedProjects}/{totalProjects} Complete</span>
          <span>•</span>
          <span className="text-primary font-semibold">{overallProgress}% Overall</span>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted">Combined Progress</span>
          <span className="text-sm font-semibold">{overallProgress}%</span>
        </div>
        <div className="w-full bg-card-border rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-primary to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-card-border rounded-lg p-4 hover:border-primary transition-colors"
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">{project.title}</h3>
                <p className="text-xs text-muted line-clamp-2">{project.description}</p>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {project.progress === 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : project.progress > 0 ? (
                  <TrendingUp className="w-5 h-5 text-primary" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-muted" />
                )}
                <span className="text-sm font-semibold">{project.progress}%</span>
              </div>
            </div>

            {/* Project Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted">Progress</span>
                <span className="text-xs text-muted">
                  {project.phases.filter(p => p.status === 'completed').length}/{project.phases.length} phases
                </span>
              </div>
              <div className="w-full bg-card-border rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className={`h-1.5 rounded-full ${
                    project.progress === 100 
                      ? 'bg-success' 
                      : project.progress > 50 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Phase Status Summary */}
            <div className="flex items-center gap-2 text-xs text-muted">
              {project.phases.map((phase, idx) => (
                <div
                  key={phase.id}
                  className={`px-2 py-1 rounded ${
                    phase.status === 'completed'
                      ? 'bg-success/20 text-success'
                      : phase.status === 'in-progress'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted/20 text-muted'
                  }`}
                >
                  {phase.name.split(':')[0]} {phase.status === 'completed' ? '✓' : phase.status === 'in-progress' ? '→' : '•'}
                </div>
              ))}
            </div>

            {/* Dates */}
            <div className="mt-3 pt-3 border-t border-card-border flex items-center justify-between text-xs text-muted">
              <span>Started: {new Date(project.startDate).toLocaleDateString('en-GB')}</span>
              <span className="capitalize">{project.status}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
