import { Router } from 'express';
import { healthRouter } from './health';
import { artistRouter } from './artist.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/artists', artistRouter);

export { router as routes };