import { Router } from 'express';
import { healthRouter } from './health';
import { spotifyTestRouter } from './spotify-test';
import { artistRouter } from './artist.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/spotify', spotifyTestRouter);
router.use('/artists', artistRouter);

export { router as routes };