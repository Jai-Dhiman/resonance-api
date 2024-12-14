import { google } from 'googleapis';

export class YouTubeService {
  private youtube;
  
  constructor() {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is required');
    }
    
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
  }

  async testSearch(query: string) {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults: 5
      });
      
      return response.data;
    } catch (error) {
      console.error('YouTube API error:', error);
      throw error;
    }
  }

  async findArtistChannel(artistName: string) {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: `${artistName} official artist channel`,
        type: ['channel'],
        maxResults: 1
      });
      
      return response.data.items?.[0];
    } catch (error) {
      console.error('YouTube API error:', error);
      return null;
    }
  }

  async getChannelStats(channelId: string) {
    const response = await this.youtube.channels.list({
      part: ['statistics'],
      id: [channelId]
    });
    
    return response.data.items?.[0]?.statistics;
  }
}