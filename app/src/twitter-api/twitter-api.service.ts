import { Tweet } from '@models';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { twitterConfig } from 'src/config/twitter.config';
import { TwitterClient } from 'twitter-api-client';

@Injectable()
export class TwitterApiService {
  twitterClient: TwitterClient;
  constructor(
    @Inject(twitterConfig.KEY)
    private readonly config: ConfigType<typeof twitterConfig>,
  ) {
    this.twitterClient = new TwitterClient({
      apiKey: config.apiKey ?? '',
      apiSecret: config.apiSecret ?? '',
      accessToken: config.accessToken,
      accessTokenSecret: config.accessTokenSecret,
    });
  }

  async search(query: string): Promise<Tweet[]> {
    const r = await this.twitterClient.tweets.search({
      q: query,
      count: 5,
      lang: 'en',
      result_type: 'popular',
    });
    return r.statuses.map(t => ({
      avatar: t.user.profile_background_image_url_https,
      createdAt: t.created_at,
      hastags: t.entities.hashtags.map(h => h.text),
      id: t.id_str,
      text: t.text,
      fullText: t.full_text,
      truncated: t.truncated,
      urls: t.entities.urls.map(u => u.url),
      userMentions: t.entities.user_mentions.map(m => ({ screenName: m.screen_name, id: m.id_str })),
      userName: t.user.screen_name,
      source: `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`,
    }));
  }
}
