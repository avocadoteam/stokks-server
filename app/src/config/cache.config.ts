import { registerAs } from '@nestjs/config';

export const cacheConfig = registerAs('cache', () => ({
  host: process.env.CACHE_HOST || 'localhost',
  port: process.env.CACHE_PORT || 6379,
  db: process.env.CACHE_DB || 13,
  uri: process.env.REDISCLOUD_URL,
}));
