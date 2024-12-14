import { Router } from 'express';
import { YouTubeService } from '../services/YouTubeService';
import { BadRequestError } from '../utils/errors';

const router = Router();
const youtubeService = new YouTubeService();

router.get('/test-search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      throw new BadRequestError('Search query is required');
    }
    
    const results = await youtubeService.testSearch(q);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

export const youtubeRouter = router;