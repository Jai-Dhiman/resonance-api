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
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:c
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
 *                 type: object
 *                 properties:
 *                   popularity:
 *                     type: integer
 *                     description: Artist popularity score (0-100)
 *                     example: 82
 *                   followers:
 *                     type: integer
 *                     description: Number of Spotify followers
 *                     example: 1500000
 *                   genres:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of associated genres
 *                     example: ["rock", "classic rock"]
 *                   name:
 *                     type: string
 *                     description: Artist name
 *                     example: "The Beatles"
 *                   images:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           description: Image URL
 *                         height:
 *                           type: integer
 *                           description: Image height
 *                         width:
 *                           type: integer
 *                           description: Image width
 *                   spotifyUrl:
 *                     type: string
 *                     description: Spotify artist page URL
 *                   id:
 *                     type: string
 *                     description: Spotify artist ID
 *                   lastUpdated:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp of when the stats were fetched
 *       400:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Failed to search artists"
 */

import { Router } from 'express';
import { SpotifyService } from '../services/SpotifyService';
import { cache } from '../middleware/cache';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { SpotifyArtist } from '../types/spotify';

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