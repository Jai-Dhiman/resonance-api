import { Router } from 'express';
import { YouTubeService } from '../services/YouTubeService';
import { BadRequestError } from '../utils/errors';

const router = Router();
const youtubeService = new YouTubeService();

router.get('/test-video-search', async (req, res, next) => {
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

router.get('/test-channel-search', async (req, res, next) => {
  try {
    const { artistName } = req.query;
    
    if (!artistName || typeof artistName !== 'string') {
      throw new BadRequestError('Artist name is required');
    }

    const channel = await youtubeService.findArtistChannel(artistName);
    
    if (!channel) {
      return res.json({
        found: false,
        message: 'No channel found'
      });
    }

    res.json({
      found: true,
      channelId: channel.id?.channelId || channel.id,
      channelTitle: channel.snippet?.title,
      channelThumbnail: channel.snippet?.thumbnails?.default?.url
    });
  } catch (error) {
    next(error);
  }
});

export const youtubeRouter = router;