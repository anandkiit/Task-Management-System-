'use client';

import { useState } from 'react';
import { Task } from '../types';
import { StatusBadge, PriorityBadge } from './ui';
import { useDeleteTask, useToggleTask } from '../hooks/useTasks';
import { Pencil, Trash2, RefreshCw, Calendar, MoreVertical } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { clsx } from 'clsx';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();

  const isOverdue =
    task.dueDate &&
    task.status !== 'COMPLETED' &&
    isPast(parseISO(task.dueDate));

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      deleteTask.mutate(task.id);
    }
    setShowMenu(false);
  };

  const handleToggle = () => {
    toggleTask.mutate(task.id);
    setShowMenu(false);
  };

  return (
    <div
      className={clsx(
        'card p-5 transition-all duration-200 hover:border-surface-4 group animate-fade-in',
        task.status === 'COMPLETED' && 'opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={clsx(
              'font-semibold text-white truncate mb-1',
              task.status === 'COMPLETED' && 'line-through text-gray-400'
            )}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span
                className={clsx(
                  'badge',
                  isOverdue
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-surface-3 text-gray-400'
                )}
              >
                <Calendar className="w-3 h-3" />
                {format(parseISO(task.dueDate), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-surface-3 rounded-lg transition-colors text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 w-44 card p-1 shadow-xl animate-slide-up">
                <button
                  onClick={() => { onEdit(task); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-surface-3 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Task
                </button>
                <button
                  onClick={handleToggle}
                  disabled={toggleTask.isPending}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-surface-3 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Toggle Status
                </button>
                <div className="border-t border-surface-4 my-1" />
                <button
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
