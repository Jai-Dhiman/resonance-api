import type SpotifyApi from 'spotify-web-api-node';

type SpotifyApiArtist = SpotifyApi.ArtistObjectFull;

export interface SpotifyImage {
  url: string;
  height?: number | undefined | null;
  width?: number | undefined | null; 
}
export interface SpotifyArtist extends SpotifyApiArtist {}

export interface ArtistStats {
  popularity: number;
  followers: number;
  genres: string[];
  name: string;
  images: SpotifyImage[];
  spotifyUrl: string;
  id: string;
  lastUpdated: string;
}