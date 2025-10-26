import { TwitterApi } from 'twitter-api-v2';

export interface TweetParams {
  content: string;
  mediaUrls?: string[];
  scheduledFor?: Date;
}

export class TwitterBot {
  private client: TwitterApi | null;
  private dryRun: boolean;

  constructor() {
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;
    
    this.dryRun = process.env.TWITTER_DRY_RUN !== 'false';

    if (apiKey && apiSecret && accessToken && accessSecret && !this.dryRun) {
      this.client = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessSecret,
      });
    } else {
      this.client = null;
      console.log('Twitter bot in DRY RUN mode');
    }
  }

  async composeDealTweet(params: {
    productTitle: string;
    price: number;
    vendor: string;
    dealUrl: string;
    dealType?: string;
  }): Promise<string> {
    const { productTitle, price, vendor, dealUrl, dealType = 'hot_deal' } = params;
    
    // Shorten product title if needed
    const shortTitle = productTitle.length > 80 ? productTitle.slice(0, 77) + '...' : productTitle;
    
    // Emoji based on deal type
    const emoji = dealType === 'price_drop' ? '📉' : '🔥';
    
    // Build tweet (max 280 chars)
    let tweet = `${emoji} ${shortTitle}\n\n`;
    tweet += `💰 $${price.toFixed(2)} at ${vendor}\n`;
    tweet += `🔗 ${dealUrl}\n\n`;
    tweet += `#TechDeals #${vendor}`;
    
    // Ensure under 280 chars
    if (tweet.length > 280) {
      const overflow = tweet.length - 280;
      const newTitleLength = shortTitle.length - overflow - 3;
      const trimmedTitle = productTitle.slice(0, newTitleLength) + '...';
      tweet = tweet.replace(shortTitle, trimmedTitle);
    }
    
    return tweet;
  }

  async postTweet(params: TweetParams): Promise<{ success: boolean; tweetId?: string; error?: string }> {
    if (this.dryRun || !this.client) {
      console.log('[DRY RUN] Would post tweet:', params.content);
      return { success: true, tweetId: 'dry_run_' + Date.now() };
    }

    try {
      const tweet = await this.client.v2.tweet(params.content);
      console.log('Tweet posted:', tweet.data.id);
      
      return {
        success: true,
        tweetId: tweet.data.id,
      };
    } catch (error: any) {
      console.error('Failed to post tweet:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async getRateLimitStatus(): Promise<{ remaining: number; reset: Date } | null> {
    if (!this.client) return null;

    try {
      const rateLimits = await this.client.v2.rateLimitStatuses();
      const tweetLimit = rateLimits.resources.tweets?.['/tweets'];
      
      if (tweetLimit) {
        return {
          remaining: tweetLimit.remaining,
          reset: new Date(tweetLimit.reset * 1000),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to check rate limits:', error);
      return null;
    }
  }
}

export const twitterBot = new TwitterBot();
