'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTasks, useTaskStats } from '../../hooks/useTasks';
import { TaskCard } from '../../components/TaskCard';
import { TaskModal } from '../../components/TaskModal';
import { StatCard, EmptyState, Spinner } from '../../components/ui';
import { Task, TaskFilters } from '../../types';
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export default function DashboardPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const debouncedSearch = useDebounce(searchInput, 400);
  const activeFilters: TaskFilters = { ...filters, search: debouncedSearch || undefined };

  const { data: tasksData, isLoading, isFetching } = useTasks(activeFilters);
  const { data: stats } = useTaskStats();

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const setFilter = (key: keyof TaskFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const toggleSort = () => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Here&apos;s what&apos;s on your plate today
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Tasks" value={stats.total} color="text-white" />
          <StatCard label="Pending" value={stats.pending} color="text-yellow-400" />
          <StatCard label="In Progress" value={stats.inProgress} color="text-blue-400" />
          <StatCard label="Completed" value={stats.completed} color="text-green-400" />
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-9 py-2.5"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filters.status || ''}
            onChange={(e) => setFilter('status', e.target.value)}
            className="input-field py-2.5 pr-8 min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Priority filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) => setFilter('priority', e.target.value)}
          className="input-field py-2.5 pr-8 min-w-[140px]"
        >
          <option value="">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Sort */}
        <div className="flex gap-2">
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => setFilter('sortBy', e.target.value)}
            className="input-field py-2.5 pr-8 min-w-[130px]"
          >
            <option value="createdAt">Created</option>
            <option value="updatedAt">Updated</option>
            <option value="dueDate">Due Date</option>
            <option value="title">Title</option>
          </select>
          <button
            onClick={toggleSort}
            className="btn-ghost px-3 py-2.5"
            title={`Sort ${filters.sortOrder === 'desc' ? 'ascending' : 'descending'}`}
          >
            {filters.sortOrder === 'desc' ? (
              <SortDesc className="w-4 h-4" />
            ) : (
              <SortAsc className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="relative">
        {(isLoading || isFetching) && (
          <div className="absolute top-0 right-0">
            <Spinner className="w-4 h-4" />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="w-8 h-8" />
          </div>
        ) : !tasksData?.items?.length ? (
          <EmptyState
            title="No tasks found"
            description={
              debouncedSearch || filters.status || filters.priority
                ? 'Try adjusting your filters'
                : "You're all clear! Create a task to get started."
            }
            action={
              !debouncedSearch && !filters.status && !filters.priority ? (
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create your first task
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {tasksData.items.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEdit} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {tasksData && tasksData.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-surface-3">
            <p className="text-sm text-gray-400">
              Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1}–
              {Math.min((filters.page || 1) * (filters.limit || 10), tasksData.total)} of{' '}
              {tasksData.total} tasks
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                disabled={!tasksData.hasPrev}
                className="btn-ghost px-3 py-2 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-300 px-2">
                Page {tasksData.page} of {tasksData.totalPages}
              </span>
              <button
                onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                disabled={!tasksData.hasNext}
                className="btn-ghost px-3 py-2 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showModal && <TaskModal task={editingTask} onClose={handleCloseModal} />}
    </div>
  );
}
