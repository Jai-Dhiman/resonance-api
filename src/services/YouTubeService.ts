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
      const searchQueries = [
        `${artistName} VEVO`,
        `${artistName} Official Artist Channel`,
        `${artistName} official`
      ];

      for (const query of searchQueries) {
        const response = await this.youtube.search.list({
          part: ['snippet'],
          q: query,
          type: ['channel'],
          maxResults: 5,
          relevanceLanguage: 'en'
        });

        const items = response.data.items || [];
      
        const bestMatch = items.find(item => {
          const title = item.snippet?.title?.toLowerCase() || '';
          const artistNameWords = artistName.toLowerCase().split(' ');
          
          const containsAllWords = artistNameWords.every(word => 
            title.includes(word)
          );

          const isOfficial = 
            title.includes('vevo') || 
            title.includes('official') ||
            title.includes('artist channel');

          const hasVerifiedIndicators = 
            (title.includes('vevo') && artistNameWords[0]) ||
            (title.includes('official') && containsAllWords) ||
            (title.includes('artist channel') && containsAllWords);

          return hasVerifiedIndicators;
        });

        if (bestMatch) {
          return bestMatch;
        }
      }

      return null;
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