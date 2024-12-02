import express from 'express';
import { SpotifyService } from '../services/SpotifyService';
import { rateLimit } from 'express-rate-limit';
import { BadRequestError, NotFoundError } from '../utils/errors';

/**
 * @swagger
 * tags:
 *   name: Artists
 *   description: Artist search and information endpoints
 */

/**
 * @swagger
 * /api/artists/search:
 *   get:
 *     summary: Search for artists by name
 *     description: |
 *       Searches for artists using the Spotify API. Returns a list of matching artists
 *       sorted by relevance. The search is performed using partial matching, so "beat"
 *       might return "The Beatles" or "Beat Connection".
 *     tags: [Artists]
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
 *         description: A list of artists matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Artist'
 *             example:
 *               - id: "3WrFJ7ztbogyGnTHbHJFl2"
 *                 name: "The Beatles"
 *                 genres: ["british invasion", "classic rock"]
 *                 popularity: 89
 *                 followers:
 *                   total: 23614867
 *       400:
 *         description: Invalid request parameters
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
 *                   example: "Search query is required"
 *       429:
 *         description: Too many requests - rate limit exceeded
 */

/**
 * @swagger
 * /api/artists/{id}:
 *   get:
 *     summary: Get detailed information about an artist
 *     description: |
 *       Retrieves comprehensive information about an artist, including their
 *       top tracks and related artists. This endpoint combines data from
 *       multiple Spotify API calls for a richer response.
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Spotify artist ID
 *         example: "3WrFJ7ztbogyGnTHbHJFl2"
 *     responses:
 *       200:
 *         description: Detailed artist information including top tracks and related artists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 artist:
 *                   $ref: '#/components/schemas/Artist'
 *                 topTracks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       popularity:
 *                         type: integer
 *                 relatedArtists:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Artist'
 *       404:
 *         $ref: '#/components/schemas/NotFound'
 */

const router = express.Router();
const spotifyService = new SpotifyService();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 
});

router.use(apiLimiter);

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      throw new BadRequestError('Search query is required');
    }
    
    const artists = await spotifyService.searchArtist(q);
    if (!artists || artists.length === 0) {
      throw new NotFoundError('No artists found matching the search query');
    }
    
    res.json(artists);
  } catch (error) {
    next(error);
  }
});


router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const artistDetails = await spotifyService.getArtistDetails(id);
    if (!artistDetails) {
      throw new NotFoundError('Artist not found');
    }
    res.json(artistDetails);
  } catch (error) {
    next(error);
  }
});

export const artistRouter = router;