import express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';

const router = express.Router();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

router.get('/test', async (req, res) => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    const results = await spotifyApi.searchArtists('Kendrick Lamar', { limit: 1 });
    
    const artistData = results.body.artists?.items[0] ?? null;
    
    res.json({
      status: 'success',
      message: 'Spotify API connection successful',
      data: artistData
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to Spotify API',
      error: errorMessage
    });
  }
});

export const spotifyTestRouter = router;