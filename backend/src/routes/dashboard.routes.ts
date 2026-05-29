import { Router } from 'express';
import { getDashboards, getDashboardById, createDashboard, updateDashboard, deleteDashboard } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getDashboards as any);
router.get('/:id', authenticate, getDashboardById as any);
router.post('/', authenticate, createDashboard as any);
router.put('/:id', authenticate, updateDashboard as any);
router.delete('/:id', authenticate, deleteDashboard as any);

export default router;
