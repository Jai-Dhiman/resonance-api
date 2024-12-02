import SpotifyWebApi from 'spotify-web-api-node';
import { ApiError, NotFoundError } from '../utils/errors';
import { redisService } from './RedisService';
import { SpotifyArtist, ArtistStats } from '../types/spotify';

export class SpotifyService {
  private spotifyApi: SpotifyWebApi;
  private tokenExpirationTime: number = 0;

  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI
    });
  }

  private async refreshAccessToken() {
    try {
      if (Date.now() > this.tokenExpirationTime) {
        console.log('Refreshing token...');
        const data = await this.spotifyApi.clientCredentialsGrant();
        this.spotifyApi.setAccessToken(data.body['access_token']);
        this.tokenExpirationTime = Date.now() + (data.body['expires_in'] - 60) * 1000;
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  private async invalidateSearchCache(query: string) {
    await redisService.del(`cache:/api/artists/search?q=${encodeURIComponent(query)}`);
  }

  private async retryWithNewToken<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.refreshAccessToken();
      return await operation();
    } catch (error) {
      if (error instanceof Error && error.message.includes('token expired')) {
        await this.refreshAccessToken();
        return await operation();
      }
      throw error;
    }
  }

  async searchArtist(query: string): Promise<SpotifyApi.ArtistObjectFull[]> {
    try {
      await this.refreshAccessToken();
      const results = await this.spotifyApi.searchArtists(query, { limit: 5 });
      return results.body.artists?.items || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(`Failed to search artists: ${error.message}`, 500);
      }
      throw new ApiError('Failed to search artists', 500);
    }
  }

  async getArtistStats(artist: SpotifyApi.ArtistObjectFull): Promise<ArtistStats> {
    try {
      const stats: ArtistStats = {
        popularity: artist.popularity,
        followers: artist.followers.total,
        genres: artist.genres,
        name: artist.name,
        images: artist.images,
        spotifyUrl: artist.external_urls.spotify,
        id: artist.id,
        lastUpdated: new Date().toISOString()
      };

      return stats;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(`Failed to process artist stats: ${error.message}`, 500);
      }
      throw new ApiError('Failed to process artist stats', 500);
    }
  }
}