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

/**
 * @swagger
 * tags:
 *   name: Artists
 *   description: Artist search and analytics endpoints
 */

/**
 * @swagger
 * /api/artists/search:
 *   get:
 *     summary: Search for artists and get their stats
 *     description: |
 *       Searches for artists using the Spotify API and returns detailed statistics.
 *       Results include popularity metrics, follower counts, and other artist information.
 *       Results are cached for 5 minutes.
 *     tags: [Artists]
 *     security:
 *       - SpotifyOAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query for artist name
 *         example: "Beatles"
 *     responses:
 *       200:
 *         description: List of artists with their stats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ArtistStats'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

  /**
 * @swagger
 * /api/artists/{id}/top-tracks:
 *   get:
 *     summary: Get an artist's top tracks
 *     description: |
 *       Retrieves the top tracks for a specific artist from Spotify.
 *       Results are cached for 30 minutes.
 *     tags: [Artists]
 *     security:
 *       - SpotifyOAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Spotify Artist ID
 *         example: "0TnOYISbd1XYRBk9myaseg"
 *     responses:
 *       200:
 *         description: Artist's top tracks
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArtistTopTracks'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

  /**
 * @swagger
 * /api/artists/{id}/youtube-stats:
 *   get:
 *     summary: Get an artist's YouTube channel statistics
 *     description: |
 *       Retrieves YouTube channel statistics for an artist based on their Spotify profile.
 *       First finds the artist's YouTube channel, then fetches detailed statistics.
 *       Results are cached for 5 minutes.
 *     tags: [Artists]
 *     security:
 *       - SpotifyOAuth: []
 *       - YouTubeAPI: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Spotify Artist ID
 *         example: "0TnOYISbd1XYRBk9myaseg"
 *     responses:
 *       200:
 *         description: Artist's YouTube channel statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 channelFound:
 *                   type: boolean
 *                   description: Indicates if a matching YouTube channel was found
 *                 channelId:
 *                   type: string
 *                   description: YouTube channel ID
 *                 channelTitle:
 *                   type: string
 *                   description: YouTube channel name
 *                 channelThumbnail:
 *                   type: string
 *                   description: URL of channel thumbnail
 *                 stats:
 *                   type: object
 *                   properties:
 *                     subscriberCount:
 *                       type: string
 *                       description: Number of channel subscribers
 *                     viewCount:
 *                       type: string
 *                       description: Total channel views
 *                     videoCount:
 *                       type: string
 *                       description: Total number of uploaded videos
 *                   nullable: true
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id/youtube-stats', cache('5m'), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('Artist ID is required');
    }
    const artist = await spotifyService.getArtist(id); 
    const artistStats = await spotifyService.getArtistStats(artist);
    
    const youtubeChannel = await youtubeService.findArtistChannel(artistStats.name);
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
});

  return router;
}

export const artistRouter = createArtistRouter(new SpotifyService());