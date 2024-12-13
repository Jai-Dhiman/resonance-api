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

export interface TopTrack {
  id: string;
  name: string;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  album: {
    name: string;
    images: SpotifyImage[];
    release_date: string;
  };
}

export interface ArtistTopTracks {
  tracks: TopTrack[];
  lastUpdated: string;
}
