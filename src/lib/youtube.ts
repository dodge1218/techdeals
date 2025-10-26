import { z } from 'zod';

const VideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnailUrl: z.string(),
  duration: z.number().optional(),
  viewCount: z.number().optional(),
});

export type Video = z.infer<typeof VideoSchema>;

export class YouTubeClient {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';
  private mockMode: boolean;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    this.mockMode = !this.apiKey || this.apiKey.startsWith('AIzaSyD_EXAMPLE');
  }

  async search(query: string, maxResults = 5): Promise<Video[]> {
    if (this.mockMode) {
      return this.getMockVideos(query);
    }

    try {
      const url = new URL(`${this.baseUrl}/search`);
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('q', query);
      url.searchParams.set('maxResults', maxResults.toString());
      url.searchParams.set('type', 'video');
      url.searchParams.set('key', this.apiKey);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.high.url,
      }));
    } catch (error) {
      console.error('YouTube search failed, falling back to mock:', error);
      return this.getMockVideos(query);
    }
  }

  async getVideoDetails(videoId: string): Promise<Video | null> {
    if (this.mockMode) {
      return this.getMockVideos('')[0] || null;
    }

    try {
      const url = new URL(`${this.baseUrl}/videos`);
      url.searchParams.set('part', 'snippet,contentDetails,statistics');
      url.searchParams.set('id', videoId);
      url.searchParams.set('key', this.apiKey);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        return null;
      }

      const item = data.items[0];
      return {
        id: item.id,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        duration: this.parseDuration(item.contentDetails.duration),
        viewCount: parseInt(item.statistics.viewCount, 10),
      };
    } catch (error) {
      console.error('YouTube video details failed:', error);
      return null;
    }
  }

  private parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  private getMockVideos(query: string): Video[] {
    return [
      {
        id: 'dQw4w9WgXcQ',
        title: `${query} - Complete Review and Buying Guide`,
        thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        duration: 720,
        viewCount: 125000,
      },
      {
        id: 'jNQXAC9IVRw',
        title: `Best ${query} for 2024 - Top 5 Picks`,
        thumbnailUrl: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',
        duration: 540,
        viewCount: 89000,
      },
      {
        id: '9bZkp7q19f0',
        title: `${query} Unboxing and First Impressions`,
        thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
        duration: 360,
        viewCount: 45000,
      },
    ];
  }

  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }
}

export const youtubeClient = new YouTubeClient();
