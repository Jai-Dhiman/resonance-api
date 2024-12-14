import { ArtistStats, TopTrack } from '../types/spotify';

export class ResponseNormalizer {
  static normalizeArtistStats(stats: ArtistStats): ArtistStats {
    return {
      ...stats,
      followers: Number(stats.followers) || 0,
      popularity: Number(stats.popularity) || 0,
      genres: Array.isArray(stats.genres) ? stats.genres : [],
      images: stats.images.map(img => ({
        url: img.url,
        height: Number(img.height) || null,
        width: Number(img.width) || null
      }))
    };
  }

  static normalizeTopTracks(tracks: TopTrack[]): TopTrack[] {
    return tracks.map(track => ({
      ...track,
      duration_ms: Number(track.duration_ms),
      popularity: Number(track.popularity)
    }));
  }
}