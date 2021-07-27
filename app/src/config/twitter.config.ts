import { registerAs } from '@nestjs/config';

export const twitterConfig = registerAs('twitter', () => ({
  apiKey: process.env.TW_API_KEY,
  apiSecret: process.env.TW_API_SECRET,
  accessToken: process.env.TW_ACCESS_TOKEN,
  accessTokenSecret: process.env.TW_ACCESS_TOKEN_SECRET,
}));
