import api from '../lib/api';
import { Task, PaginatedResponse, TaskFilters, TaskStats } from '../types';

export const taskService = {
  async getTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    const { data } = await api.get(`/tasks?${params.toString()}`);
    return data.data;
  },

  async getTask(id: string): Promise<Task> {
    const { data } = await api.get(`/tasks/${id}`);
    return data.data;
  },

  async createTask(payload: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
  }): Promise<Task> {
    const { data } = await api.post('/tasks', payload);
    return data.data;
  },

  async updateTask(
    id: string,
    payload: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
    }
  ): Promise<Task> {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    return data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async toggleTask(id: string): Promise<Task> {
    const { data } = await api.patch(`/tasks/${id}/toggle`);
    return data.data;
  },

  async getStats(): Promise<TaskStats> {
    const { data } = await api.get('/tasks/stats');
    return data.data;
  },
};
