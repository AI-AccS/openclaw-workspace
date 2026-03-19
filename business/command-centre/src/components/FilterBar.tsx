'use client';

import { Filter, Search, X, Funnel } from 'lucide-react';
import { useState } from 'react';
import { Task, Priority, Status } from '@/types';

export default function FilterBar({ 
  tasks,
  onFilterChange,
  activeFilters 
}: { 
  tasks: Task[];
  onFilterChange: (filters: any) => void;
  activeFilters: any;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'backlog', label: 'Backlog' },
    { value: 'todo', label: 'Todo' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
  ];

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'dawn', label: 'Dawn' },
    { value: 'human', label: 'Human' },
    { value: 'both', label: 'Both' },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onFilterChange({
      search: query,
      priority: selectedPriority,
      status: selectedStatus,
      assignee: selectedAssignee,
    });
  };

  const handlePriorityChange = (priority: string) => {
    setSelectedPriority(priority);
    onFilterChange({
      search: searchQuery,
      priority,
      status: selectedStatus,
      assignee: selectedAssignee,
    });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onFilterChange({
      search: searchQuery,
      priority: selectedPriority,
      status,
      assignee: selectedAssignee,
    });
  };

  const handleAssigneeChange = (assignee: string) => {
    setSelectedAssignee(assignee);
    onFilterChange({
      search: searchQuery,
      priority: selectedPriority,
      status: selectedStatus,
      assignee,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPriority('all');
    setSelectedStatus('all');
    setSelectedAssignee('all');
    onFilterChange({
      search: '',
      priority: 'all',
      status: 'all',
      assignee: 'all',
    });
  };

  const hasActiveFilters = searchQuery || selectedPriority !== 'all' || selectedStatus !== 'all' || selectedAssignee !== 'all';

  return (
    <div className="bg-card border border-card-border rounded-xl p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-card-border/50 border border-card-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => handlePriorityChange(e.target.value)}
          className="bg-card-border/50 border border-card-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          {priorityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-card-border/50 border border-card-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Assignee Filter */}
        <select
          value={selectedAssignee}
          onChange={(e) => handleAssigneeChange(e.target.value)}
          className="bg-card-border/50 border border-card-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          {assigneeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors px-3 py-2"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Clear All</span>
          </button>
        )}

        {/* Filter Badge */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1 bg-primary/20 text-primary text-xs px-3 py-1 rounded-full">
            <Filter className="w-3 h-3" />
            <span>Filters Active</span>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-card-border flex items-center gap-4 text-sm text-muted">
          <span className="font-semibold">Active Filters:</span>
          {searchQuery && (
            <span className="bg-card-border px-2 py-1 rounded">Search: "{searchQuery}"</span>
          )}
          {selectedPriority !== 'all' && (
            <span className="bg-card-border px-2 py-1 rounded">Priority: {selectedPriority}</span>
          )}
          {selectedStatus !== 'all' && (
            <span className="bg-card-border px-2 py-1 rounded">Status: {selectedStatus}</span>
          )}
          {selectedAssignee !== 'all' && (
            <span className="bg-card-border px-2 py-1 rounded">Assignee: {selectedAssignee}</span>
          )}
        </div>
      )}
    </div>
  );
}
