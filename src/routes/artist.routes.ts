
import { Router } from 'express';
import { SpotifyService } from '../services/SpotifyService';
import { cache } from '../middleware/cache';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { SpotifyArtist } from '../types/spotify';


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

  router.get('/search', cache('5m'), async (req, res, next) => {
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

  return router;
}

export const artistRouter = createArtistRouter(new SpotifyService());