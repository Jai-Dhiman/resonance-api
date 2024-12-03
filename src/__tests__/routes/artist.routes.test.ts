import request from 'supertest';
import express from 'express';
import { artistRouter } from '../../routes/artist.routes';
import { SpotifyService } from '../../services/SpotifyService';

jest.mock('../../services/SpotifyService');

const app = express();
app.use(express.json());
app.use('/api/artists', artistRouter);

describe('Artist Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/artists/search', () => {
    it('should return artist stats when search is successful', async () => {
      const mockArtistStats = {
        name: 'Test Artist',
        popularity: 80,
        followers: 1000,
        genres: ['rock'],
        images: [],
        spotifyUrl: 'http://spotify.com',
        id: '123',
        lastUpdated: expect.any(String) // Change this line to expect any string
      };

      // @ts-ignore - Mock implementation
      SpotifyService.prototype.searchArtist.mockResolvedValue([{}]);
      // @ts-ignore - Mock implementation
      SpotifyService.prototype.getArtistStats.mockResolvedValue({
        ...mockArtistStats,
        lastUpdated: new Date().toISOString()
      });

      const response = await request(app)
        .get('/api/artists/search')
        .query({ q: 'Test Artist' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      
      // Verify the structure and content without exact timestamp matching
      expect(response.body[0]).toMatchObject({
        name: mockArtistStats.name,
        popularity: mockArtistStats.popularity,
        followers: mockArtistStats.followers,
        genres: mockArtistStats.genres,
        images: mockArtistStats.images,
        spotifyUrl: mockArtistStats.spotifyUrl,
        id: mockArtistStats.id
      });
      
      // Verify the lastUpdated is a valid ISO string
      expect(Date.parse(response.body[0].lastUpdated)).not.toBeNaN();
    });

    // ... rest of the tests
  });
});