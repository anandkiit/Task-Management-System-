import { Router } from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  getTaskStats,
  createTaskValidation,
  updateTaskValidation,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.post('/', createTaskValidation, validate, createTask);
router.get('/:id', getTask);
router.patch('/:id', updateTaskValidation, validate, updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTask);

export default router;
