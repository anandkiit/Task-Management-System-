'use client';

import { clsx } from 'clsx';
import { TaskStatus, Priority } from '../../types';
import { CheckCircle2, Clock, PlayCircle, ClipboardList } from 'lucide-react';

// Status Badge
export const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const config = {
    PENDING: { label: 'Pending', icon: Clock, className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
    IN_PROGRESS: { label: 'In Progress', icon: PlayCircle, className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    COMPLETED: { label: 'Completed', icon: CheckCircle2, className: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  };
  const { label, icon: Icon, className } = config[status];
  return (
    <span className={clsx('badge', className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// Priority Badge
export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const config = {
    LOW: { label: 'Low', className: 'bg-gray-500/10 text-gray-400 border border-gray-500/20' },
    MEDIUM: { label: 'Medium', className: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' },
    HIGH: { label: 'High', className: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  };
  const { label, className } = config[priority];
  return <span className={clsx('badge', className)}>{label}</span>;
};

// Spinner
export const Spinner = ({ className }: { className?: string }) => (
  <div className={clsx('w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin', className)} />
);

// Loading Screen
export const LoadingScreen = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center">
    <div className="text-center">
      <Spinner className="w-8 h-8 mx-auto mb-3" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

// Empty State
export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="w-16 h-16 bg-surface-3 rounded-2xl flex items-center justify-center mb-4">
      <ClipboardList className="w-8 h-8 text-gray-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-200 mb-1">{title}</h3>
    <p className="text-gray-400 text-sm max-w-xs mb-6">{description}</p>
    {action}
  </div>
);

// Stat Card
export const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="card p-5">
    <div className={clsx('text-3xl font-bold mb-1', color)}>{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);
