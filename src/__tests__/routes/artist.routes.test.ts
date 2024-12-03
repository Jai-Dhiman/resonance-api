import request from 'supertest';
import express from 'express';
import { createArtistRouter } from '../../routes/artist.routes';
import { SpotifyService } from '../../services/SpotifyService';
import { cache } from '../../middleware/cache';
import { errorHandler } from '../../middleware/errorHandler';
import type { ArtistStats } from '../../types/spotify';
import type SpotifyWebApi from 'spotify-web-api-node';

jest.mock('../../services/SpotifyService');
jest.mock('../../middleware/cache', () => ({
  cache: jest.fn(() => (req: any, res: any, next: any) => next()),
}));

const mockArtist: SpotifyApi.ArtistObjectFull = {
  id: '123',
  name: 'Test Artist',
  popularity: 80,
  followers: { total: 1000000, href: null },
  genres: ['pop'],
  images: [{ url: 'test-image.jpg', height: 300, width: 300 }],
  external_urls: { spotify: 'https://spotify.com/artist/123' },
  href: 'https://api.spotify.com/v1/artists/123',
  type: 'artist',
  uri: 'spotify:artist:123'
};

const mockArtistStats: ArtistStats = {
  id: '123',
  name: 'Test Artist',
  popularity: 80,
  followers: 1000000,
  genres: ['pop'],
  images: [{ url: 'test-image.jpg', height: 300, width: 300 }],
  spotifyUrl: 'https://spotify.com/artist/123',
  lastUpdated: new Date().toISOString()
};

describe('Artist Routes', () => {
  let app: express.Application;
  let mockSpotifyService: jest.Mocked<SpotifyService>;

  beforeEach(() => {
    jest.clearAllMocks();
      
    app = express();
    app.use(express.json());
  
    // Create a mock instance of SpotifyService
    mockSpotifyService = {
      searchArtist: jest.fn(),
      getArtistStats: jest.fn()
    } as unknown as jest.Mocked<SpotifyService>;
  
    // Add the router
    app.use('/api/artists', createArtistRouter(mockSpotifyService));
    
    // Add the error handler middleware after the routes
    app.use(errorHandler);
  });

  describe('GET /search', () => {
    it('should return artist stats when search is successful', async () => {
      mockSpotifyService.searchArtist.mockResolvedValue([mockArtist]);
      mockSpotifyService.getArtistStats.mockResolvedValue(mockArtistStats);

      const response = await request(app)
        .get('/api/artists/search')
        .query({ q: 'Test Artist' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockArtistStats]);
      expect(mockSpotifyService.searchArtist).toHaveBeenCalledWith('Test Artist');
      expect(mockSpotifyService.getArtistStats).toHaveBeenCalledWith(mockArtist);
    });

    // src/__tests__/routes/artist.routes.test.ts
// Update the error test cases:

it('should return 400 when query parameter is missing', async () => {
  const response = await request(app)
    .get('/api/artists/search');

  expect(response.status).toBe(400);
  expect(response.body).toEqual({
    status: 'error',
    message: 'Search query is required'
  });
});

it('should return 404 when no artists are found', async () => {
  mockSpotifyService.searchArtist.mockResolvedValue([]);

  const response = await request(app)
    .get('/api/artists/search')
    .query({ q: 'Nonexistent Artist' });

  expect(response.status).toBe(404);
  expect(response.body).toEqual({
    status: 'error',
    message: 'No artists found matching the search query'
  });
});

it('should handle SpotifyService errors gracefully', async () => {
  mockSpotifyService.searchArtist.mockRejectedValue(new Error('Spotify API error'));

  const response = await request(app)
    .get('/api/artists/search')
    .query({ q: 'Test Artist' });

  expect(response.status).toBe(500);
  expect(response.body).toEqual({
    status: 'error',
    message: expect.any(String)
  });
});

    it('should use cache middleware', async () => {
      await request(app)
        .get('/api/artists/search')
        .query({ q: 'Test Artist' });

      expect(cache).toHaveBeenCalledWith('5m');
    });
  });
});