import { Router } from 'express';
import { healthRouter } from './health';
import { artistRouter } from './artist.routes';
import { youtubeRouter } from './youtube.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/artists', artistRouter);
router.use('/youtube', youtubeRouter);

export { router as routes };