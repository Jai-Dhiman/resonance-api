import { Router } from 'express';
import { SpotifyService } from '../services/SpotifyService';
import { YouTubeService } from '../services/YouTubeService';
import { cache } from '../middleware/cache';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { SpotifyArtist } from '../types/spotify';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { artistSearchSchema, artistIdSchema } from '../validation/schemas';

const youtubeService = new YouTubeService();

export function createArtistRouter(spotifyService: SpotifyService) {
  const router = Router();

  router.get('/search', rateLimiter(100, '15m'),
  validate(artistSearchSchema),
  cache('5m'), async (req, res, next) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        throw new BadRequestError('Search query is required');
      }
      
      const artists = await spotifyService.searchArtist(q);
      if (!artists || artists.length === 0) {
        throw new NotFoundError('No artists found matching the search query');
      }
      
      const artistStats = await Promise.all(
        artists.map(artist => spotifyService.getArtistStats(artist))
      );
      
      res.json(artistStats);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id/top-tracks',rateLimiter(300, '15m'),
  validate(artistIdSchema),
  cache('30m'), async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Artist ID is required');
      }
      
      const topTracks = await spotifyService.getArtistTopTracks(id);
      res.json(topTracks);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id/youtube-stats', 
    rateLimiter(300, '15m'),
    validate(artistIdSchema),
    cache('5m'), 
    async (req, res, next) => {
      try {
        const { id } = req.params;
        if (!id) {
          throw new BadRequestError('Artist ID is required');
        }

        const artist = await spotifyService.getArtist(id);
        
        const youtubeChannel = await youtubeService.findArtistChannel(artist.name);
        
        if (!youtubeChannel || !youtubeChannel.id) {
          return res.json({
            channelFound: false,
            stats: null
          });
        }

        const channelId = typeof youtubeChannel.id === 'string'
          ? youtubeChannel.id
          : youtubeChannel.id.channelId;

        if (!channelId) {
          return res.json({
            channelFound: false,
            stats: null
          });
        }

        const youtubeStats = await youtubeService.getChannelStats(channelId);

        res.json({
          channelFound: true,
          channelId: channelId,
          channelTitle: youtubeChannel.snippet?.title,
          channelThumbnail: youtubeChannel.snippet?.thumbnails?.default?.url,
          stats: youtubeStats
        });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}

export const artistRouter = createArtistRouter(new SpotifyService());