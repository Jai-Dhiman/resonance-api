import { SpotifyService } from '../../services/SpotifyService';
import { ApiError } from '../../utils/errors';
import SpotifyWebApi from 'spotify-web-api-node';

jest.mock('spotify-web-api-node', () => {
  return jest.fn().mockImplementation(() => ({
    clientCredentialsGrant: jest.fn().mockResolvedValue({
      body: {
        access_token: 'mock_access_token',
        expires_in: 3600
      }
    }),
    setAccessToken: jest.fn(),
    searchArtists: jest.fn()
  }));
});

jest.mock('../../services/RedisService');

describe('SpotifyService', () => {
  let spotifyService: SpotifyService;
  let mockSpotifyApi: jest.Mocked<SpotifyWebApi>;

  beforeEach(() => {
    jest.clearAllMocks();
    spotifyService = new SpotifyService();
    mockSpotifyApi = (spotifyService as any).spotifyApi;
  });

  describe('searchArtist', () => {
    const mockArtist = {
      id: '123',
      name: 'Test Artist',
      popularity: 80,
      followers: { total: 1000 },
      genres: ['rock'],
      external_urls: { spotify: 'http://spotify.com' },
      images: []
    };

    beforeEach(() => {
      // Setup the mock response for searchArtists
      mockSpotifyApi.searchArtists.mockResolvedValue({
        body: {
          artists: {
            items: [mockArtist]
          }
        }
      } as any);
    });

    it('should return artist search results', async () => {
      const result = await spotifyService.searchArtist('Test Artist');
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Artist');
      expect(mockSpotifyApi.searchArtists).toHaveBeenCalledWith('Test Artist', { limit: 5 });
    });

    it('should throw ApiError when search fails', async () => {
      mockSpotifyApi.searchArtists.mockRejectedValue(new Error('API Error'));

      await expect(spotifyService.searchArtist('Test')).rejects.toThrow(ApiError);
    });
  });
});