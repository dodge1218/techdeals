/**
 * YouTube Data API v3 Adapter
 * Mock implementation - swap to real API when key is available
 */

import { VideoAdapter, VideoData, VideoSearchOptions, AdapterConfig } from './types';

export class YouTubeAdapter implements VideoAdapter {
  name = 'youtube';
  private config: AdapterConfig;
  private mockMode: boolean;

  constructor(config?: AdapterConfig) {
    this.config = config || {};
    this.mockMode = !this.config.apiKey;
    
    if (this.mockMode) {
      console.log('⚠️  YouTubeAdapter: Using mock data (no API key configured)');
    }
  }

  async searchVideos(options: VideoSearchOptions): Promise<VideoData[]> {
    if (this.mockMode) {
      return this.getMockVideos(options);
    }

    // Real YouTube Data API implementation would go here
    console.warn('YouTube API not implemented, using mock data');
    return this.getMockVideos(options);
  }

  async getVideo(externalId: string): Promise<VideoData | null> {
    const videos = await this.getMockVideos({ query: '' });
    return videos.find(v => v.externalId === externalId) || null;
  }

  isUsingMockData(): boolean {
    return this.mockMode;
  }

  private async getMockVideos(options: VideoSearchOptions): Promise<VideoData[]> {
    // Base mock video database
    const allMockVideos: VideoData[] = [
      // GPU/Graphics Card videos
      {
        platform: 'youtube',
        externalId: 'dQw4w9WgXcQ',
        title: 'RTX 4090 Review: The Ultimate Gaming GPU?',
        description: 'Full review and benchmark results of the NVIDIA RTX 4090 Founders Edition. Testing 4K gaming, ray tracing, and productivity workloads.',
        channelName: 'Linus Tech Tips',
        thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: 847,
        viewCount: 1234567,
        likeCount: 45678,
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        embedUrl: 'https://youtube.com/embed/dQw4w9WgXcQ',
        publishedAt: new Date('2024-11-15'),
      },
      {
        platform: 'youtube',
        externalId: 'jNQXAC9IVRw',
        title: 'RTX 4090 Mining Performance Test - All Algorithms',
        description: 'Testing the RTX 4090 hashrate on Ethereum, Kaspa, Ravencoin, and more.',
        channelName: 'Gamers Nexus',
        thumbnailUrl: 'https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
        duration: 1024,
        viewCount: 876543,
        likeCount: 32145,
        url: 'https://youtube.com/watch?v=jNQXAC9IVRw',
        embedUrl: 'https://youtube.com/embed/jNQXAC9IVRw',
        publishedAt: new Date('2024-10-20'),
      },
      {
        platform: 'youtube',
        externalId: '9bZkp7q19f0',
        title: 'RTX 4090 vs 4080: Worth the $600 Upgrade?',
        description: 'Comparing the RTX 4090 and 4080 in gaming, productivity, and value.',
        channelName: 'JayzTwoCents',
        thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg',
        duration: 625,
        viewCount: 543210,
        likeCount: 23456,
        url: 'https://youtube.com/watch?v=9bZkp7q19f0',
        embedUrl: 'https://youtube.com/embed/9bZkp7q19f0',
        publishedAt: new Date('2024-12-05'),
      },

      // CPU videos
      {
        platform: 'youtube',
        externalId: 'astISOttCQ0',
        title: 'Intel i9-13900K Review: Gaming & Productivity Beast',
        description: 'Complete review of Intel\'s flagship processor with benchmarks.',
        channelName: 'Hardware Unboxed',
        thumbnailUrl: 'https://i.ytimg.com/vi/astISOttCQ0/maxresdefault.jpg',
        duration: 912,
        viewCount: 654321,
        likeCount: 28901,
        url: 'https://youtube.com/watch?v=astISOttCQ0',
        embedUrl: 'https://youtube.com/embed/astISOttCQ0',
        publishedAt: new Date('2024-09-10'),
      },
      {
        platform: 'youtube',
        externalId: 'ZA0N_5oKZDg',
        title: 'AMD Ryzen 9 7950X3D vs Intel i9-13900K',
        description: 'The ultimate CPU showdown for gaming and content creation.',
        channelName: 'Hardware Unboxed',
        thumbnailUrl: 'https://i.ytimg.com/vi/ZA0N_5oKZDg/maxresdefault.jpg',
        duration: 1156,
        viewCount: 789012,
        url: 'https://youtube.com/watch?v=ZA0N_5oKZDg',
        embedUrl: 'https://youtube.com/embed/ZA0N_5oKZDg',
        publishedAt: new Date('2024-08-22'),
      },

      // Mining videos
      {
        platform: 'youtube',
        externalId: 'L_jWHffIx5E',
        title: 'Antminer S19 Pro Setup Guide & Profitability 2025',
        description: 'Complete setup tutorial and ROI calculation for Bitcoin mining.',
        channelName: 'VoskCoin',
        thumbnailUrl: 'https://i.ytimg.com/vi/L_jWHffIx5E/maxresdefault.jpg',
        duration: 1534,
        viewCount: 234567,
        likeCount: 8976,
        url: 'https://youtube.com/watch?v=L_jWHffIx5E',
        embedUrl: 'https://youtube.com/embed/L_jWHffIx5E',
        publishedAt: new Date('2024-07-15'),
      },
      {
        platform: 'youtube',
        externalId: 'yXWw0_UfSRs',
        title: 'Is Bitcoin Mining Still Profitable in 2025?',
        description: 'Analysis of Bitcoin mining profitability with current hardware.',
        channelName: 'Crypto Mining Insider',
        thumbnailUrl: 'https://i.ytimg.com/vi/yXWw0_UfSRs/maxresdefault.jpg',
        duration: 843,
        viewCount: 456789,
        likeCount: 15432,
        url: 'https://youtube.com/watch?v=yXWw0_UfSRs',
        embedUrl: 'https://youtube.com/embed/yXWw0_UfSRs',
        publishedAt: new Date('2025-01-08'),
      },

      // Phone videos
      {
        platform: 'youtube',
        externalId: 'AXZZXzuMmJQ',
        title: 'iPhone 15 Pro Max Review: The Complete Package',
        description: 'In-depth review of Apple\'s flagship phone with titanium design.',
        channelName: 'MKBHD',
        thumbnailUrl: 'https://i.ytimg.com/vi/AXZZXzuMmJQ/maxresdefault.jpg',
        duration: 721,
        viewCount: 3456789,
        likeCount: 123456,
        url: 'https://youtube.com/watch?v=AXZZXzuMmJQ',
        embedUrl: 'https://youtube.com/embed/AXZZXzuMmJQ',
        publishedAt: new Date('2024-09-25'),
      },
      {
        platform: 'youtube',
        externalId: 'CW4CnXA9kTU',
        title: 'iPhone 15 Pro Max Camera Test: Worth the Upgrade?',
        description: 'Real-world camera testing in various conditions.',
        channelName: 'MrMobile',
        thumbnailUrl: 'https://i.ytimg.com/vi/CW4CnXA9kTU/maxresdefault.jpg',
        duration: 548,
        viewCount: 987654,
        likeCount: 43210,
        url: 'https://youtube.com/watch?v=CW4CnXA9kTU',
        embedUrl: 'https://youtube.com/embed/CW4CnXA9kTU',
        publishedAt: new Date('2024-10-05'),
      },
      {
        platform: 'youtube',
        externalId: '1La4QzGeaaQ',
        title: 'Galaxy S24 Ultra Review: Samsung Does It Again',
        description: 'Full review of the S24 Ultra with 200MP camera and S Pen.',
        channelName: 'MKBHD',
        thumbnailUrl: 'https://i.ytimg.com/vi/1La4QzGeaaQ/maxresdefault.jpg',
        duration: 834,
        viewCount: 2345678,
        likeCount: 98765,
        url: 'https://youtube.com/watch?v=1La4QzGeaaQ',
        embedUrl: 'https://youtube.com/embed/1La4QzGeaaQ',
        publishedAt: new Date('2024-11-28'),
      },

      // Gaming setup videos
      {
        platform: 'youtube',
        externalId: 'QnddHR2JCCY',
        title: 'Herman Miller Aeron: Is It Worth $1500?',
        description: 'Honest review after 6 months of daily use.',
        channelName: 'Ahnestly',
        thumbnailUrl: 'https://i.ytimg.com/vi/QnddHR2JCCY/maxresdefault.jpg',
        duration: 456,
        viewCount: 567890,
        likeCount: 21098,
        url: 'https://youtube.com/watch?v=QnddHR2JCCY',
        embedUrl: 'https://youtube.com/embed/QnddHR2JCCY',
        publishedAt: new Date('2024-06-12'),
      },
      {
        platform: 'youtube',
        externalId: 'eT8VlyWxd2Q',
        title: 'Lian Li DK-04F Desk Review: The Ultimate Gaming Setup',
        description: 'Full review of the premium motorized standing desk.',
        channelName: 'Optimum Tech',
        thumbnailUrl: 'https://i.ytimg.com/vi/eT8VlyWxd2Q/maxresdefault.jpg',
        duration: 678,
        viewCount: 345678,
        likeCount: 14567,
        url: 'https://youtube.com/watch?v=eT8VlyWxd2Q',
        embedUrl: 'https://youtube.com/embed/eT8VlyWxd2Q',
        publishedAt: new Date('2024-08-03'),
      },

      // General PC building
      {
        platform: 'youtube',
        externalId: 'BL4DCEp7blY',
        title: 'How To Build A Gaming PC in 2025 - Complete Guide',
        description: 'Step-by-step PC building tutorial for beginners.',
        channelName: 'Linus Tech Tips',
        thumbnailUrl: 'https://i.ytimg.com/vi/BL4DCEp7blY/maxresdefault.jpg',
        duration: 1823,
        viewCount: 4567890,
        url: 'https://youtube.com/watch?v=BL4DCEp7blY',
        embedUrl: 'https://youtube.com/embed/BL4DCEp7blY',
        publishedAt: new Date('2025-01-05'),
      },
    ];

    // Filter by query
    let filtered = allMockVideos;
    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = allMockVideos.filter(v =>
        v.title.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query) ||
        v.channelName?.toLowerCase().includes(query)
      );
    }

    // Sort by order
    if (options.order) {
      switch (options.order) {
        case 'viewCount':
          filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
          break;
        case 'date':
          filtered.sort((a, b) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
          });
          break;
        case 'relevance':
        default:
          // Already in relevance order from filter
          break;
      }
    }

    // Apply limit
    const maxResults = options.maxResults || 5;
    return filtered.slice(0, maxResults);
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function searchVideos(query: string, maxResults = 5) {
  const adapter = new YouTubeAdapter()
  return adapter.searchVideos({ query, maxResults })
}
