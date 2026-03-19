import { Response } from 'express';
import { PrismaClient, TaskStatus, Priority } from '@prisma/client';
import { body, param } from 'express-validator';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest, TaskQueryParams, PaginatedResponse } from '../types';

const prisma = new PrismaClient();

export const createTaskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];

export const updateTaskValidation = [
  param('id').isUUID().withMessage('Invalid task ID'),
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('dueDate').optional().isISO8601(),
];

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    page = '1',
    limit = '10',
    status,
    search,
    priority,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query as TaskQueryParams;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  try {
    const where = {
      userId: req.user!.id,
      ...(status && { status: status as TaskStatus }),
      ...(priority && { priority: priority as Priority }),
      ...(search && {
        title: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    const response: PaginatedResponse<typeof tasks[0]> = {
      items: tasks,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    };

    sendSuccess(res, 'Tasks retrieved', response);
  } catch (err) {
    console.error('getTasks error:', err);
    sendError(res, 'Internal server error', 500);
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    sendSuccess(res, 'Task retrieved', task);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, priority, dueDate } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user!.id,
      },
    });

    sendSuccess(res, 'Task created', task, 201);
  } catch (err) {
    console.error('createTask error:', err);
    sendError(res, 'Internal server error', 500);
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate } = req.body;

  try {
    const existing = await prisma.task.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });

    sendSuccess(res, 'Task updated', task);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const existing = await prisma.task.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      sendError(res, 'Task not found', 404);
      return;
    }

    await prisma.task.delete({ where: { id } });
    sendSuccess(res, 'Task deleted');
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

export const toggleTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const existing = await prisma.task.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const nextStatus: Record<TaskStatus, TaskStatus> = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'PENDING',
    };

    const task = await prisma.task.update({
      where: { id },
      data: { status: nextStatus[existing.status] },
    });

    sendSuccess(res, 'Task status toggled', task);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

export const getTaskStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [total, pending, inProgress, completed] = await Promise.all([
      prisma.task.count({ where: { userId: req.user!.id } }),
      prisma.task.count({ where: { userId: req.user!.id, status: 'PENDING' } }),
      prisma.task.count({ where: { userId: req.user!.id, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { userId: req.user!.id, status: 'COMPLETED' } }),
    ]);

    sendSuccess(res, 'Stats retrieved', { total, pending, inProgress, completed });
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};
