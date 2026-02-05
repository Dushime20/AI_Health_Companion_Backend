import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import diagnosisRoutes from './diagnosis.routes';
import syncRoutes from './sync.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/diagnosis', diagnosisRoutes);
router.use('/sync', syncRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
