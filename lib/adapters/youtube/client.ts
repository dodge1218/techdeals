/**
 * YouTube Data API v3 Adapter
 * Searches and fetches video metadata for product embeds
 * Falls back to mock data if API key not configured
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelName: string;
  channelId: string;
  publishedAt: string;
  duration?: string;
  viewCount?: number;
  likeCount?: number;
  url: string;
  embedUrl: string;
}

export interface YouTubeSearchParams {
  query: string;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'viewCount' | 'rating';
  publishedAfter?: string;
}

const API_KEY = process.env.YOUTUBE_API_KEY;
const API_ENABLED = API_KEY && API_KEY.length > 20 && !API_KEY.includes('your_');
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Search YouTube for videos matching query
 */
export async function searchVideos(params: YouTubeSearchParams): Promise<YouTubeVideo[]> {
  if (!API_ENABLED) {
    console.log('📹 YouTube API not configured - using mock data');
    return getMockVideos(params.query);
  }

  const { query, maxResults = 5, order = 'relevance', publishedAfter } = params;

  try {
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults.toString(),
      order,
      key: API_KEY!,
    });

    if (publishedAfter) {
      searchParams.set('publishedAfter', publishedAfter);
    }

    const searchUrl = `${BASE_URL}/search?${searchParams}`;
    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Get video IDs for additional details
    const videoIds = data.items.map((item: any) => item.id.videoId);
    
    // Fetch video statistics and contentDetails
    const videos = await getVideoDetails(videoIds);
    
    return videos;
  } catch (error) {
    console.error('YouTube API search error:', error);
    return getMockVideos(query);
  }
}

/**
 * Get detailed information for specific video IDs
 */
export async function getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
  if (!API_ENABLED) {
    return getMockVideos('');
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(','),
      key: API_KEY!,
    });

    const url = `${BASE_URL}/videos?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelName: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      duration: item.contentDetails?.duration,
      viewCount: parseInt(item.statistics?.viewCount || '0'),
      likeCount: parseInt(item.statistics?.likeCount || '0'),
      url: `https://www.youtube.com/watch?v=${item.id}`,
      embedUrl: `https://www.youtube.com/embed/${item.id}`,
    }));
  } catch (error) {
    console.error('YouTube API details error:', error);
    return [];
  }
}

/**
 * Get single video by ID
 */
export async function getVideo(videoId: string): Promise<YouTubeVideo | null> {
  const videos = await getVideoDetails([videoId]);
  return videos[0] || null;
}

/**
 * Mock video data for development/testing
 */
function getMockVideos(query: string): YouTubeVideo[] {
  const baseVideos: YouTubeVideo[] = [
    {
      id: 'dQw4w9WgXcQ',
      title: `${query} - Complete Review & Unboxing`,
      description: `In-depth review and unboxing of ${query}. We cover specs, performance, and whether it's worth your money.`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
      channelName: 'TechReview Pro',
      channelId: 'UC123456789',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 'PT12M34S',
      viewCount: 1250000,
      likeCount: 45000,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      id: 'jNQXAC9IVRw',
      title: `Is ${query} Worth It? Honest Opinion`,
      description: `My honest thoughts after 30 days with ${query}. Pros, cons, and alternatives.`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400',
      channelName: 'Honest Tech',
      channelId: 'UC987654321',
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 'PT8M15S',
      viewCount: 875000,
      likeCount: 32000,
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      embedUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    },
    {
      id: 'o-YBDTqX_ZU',
      title: `${query} Setup Guide & Tips`,
      description: `Step-by-step setup guide for ${query} with optimization tips and tricks.`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
      channelName: 'Setup Central',
      channelId: 'UC456789123',
      publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 'PT15M42S',
      viewCount: 654000,
      likeCount: 28000,
      url: 'https://www.youtube.com/watch?v=o-YBDTqX_ZU',
      embedUrl: 'https://www.youtube.com/embed/o-YBDTqX_ZU',
    },
  ];

  return baseVideos.slice(0, 3);
}

/**
 * Convert ISO 8601 duration to human-readable format
 * e.g., "PT12M34S" -> "12:34"
 */
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format view count to human-readable string
 * e.g., 1250000 -> "1.2M"
 */
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
