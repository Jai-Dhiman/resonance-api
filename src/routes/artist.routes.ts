import express from 'express';
import { SpotifyService } from '../services/SpotifyService';
import { rateLimit } from 'express-rate-limit';
import { BadRequestError, NotFoundError } from '../utils/errors';

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