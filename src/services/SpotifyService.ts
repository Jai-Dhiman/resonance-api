import SpotifyWebApi from 'spotify-web-api-node';
import { ApiError, NotFoundError } from '../utils/errors';

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
    if (Date.now() > this.tokenExpirationTime) {
      const data = await this.spotifyApi.clientCredentialsGrant();
      this.spotifyApi.setAccessToken(data.body['access_token']);
      this.tokenExpirationTime = Date.now() + (data.body['expires_in'] - 60) * 1000;
    }
  }

  async searchArtist(query: string) {
    return this.retryWithNewToken(async () => {
      try {
        const results = await this.spotifyApi.searchArtists(query, { limit: 5 });
        return results.body.artists?.items;
      } catch (error) {
        if (error instanceof Error) {
          throw new ApiError(`Failed to search artists: ${error.message}`, 500);
        }
        throw new ApiError('Failed to search artists', 500);
      }
    });
  }

  async getArtistDetails(artistId: string) {
    try {
      await this.refreshAccessToken();
      const [artist, topTracks, relatedArtists] = await Promise.all([
        this.spotifyApi.getArtist(artistId),
        this.spotifyApi.getArtistTopTracks(artistId, 'US'),
        this.spotifyApi.getArtistRelatedArtists(artistId)
      ]);

      if (!artist.body) {
        throw new NotFoundError(`Artist with ID ${artistId} not found`);
      }

      return {
        artist: artist.body,
        topTracks: topTracks.body.tracks,
        relatedArtists: relatedArtists.body.artists
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ApiError(`Failed to fetch artist details: ${error.message}`, 500);
      }
      throw new ApiError('Failed to fetch artist details', 500);
    }
  }

  private async retryWithNewToken<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Error && error.message.includes('token expired')) {
        await this.refreshAccessToken();
        return await operation();
      }
      throw error;
    }
  }
}