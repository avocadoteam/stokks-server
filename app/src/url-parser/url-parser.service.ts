import { UrlParseResponse } from '@models';
import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { HashUrlParser } from 'src/contracts/redis-cache';
import { RedisHashService } from 'src/redis-cache/redis-cache.module';
import { dayInS } from 'src/utils/time';

@Injectable()
export class UrlParserService {
  constructor(private readonly redis: RedisHashService) {}

  async getArticleImg(link: string): Promise<UrlParseResponse> {
    console.debug('run url parser');

    const cachedLink = await this.redis.hgetField(HashUrlParser.ParsedArticles, link);

    if (cachedLink) {
      console.debug('return from cached');

      return {
        imgUrl: cachedLink,
      };
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--js-flags="--max-old-space-size=128"'],
    });
    const page = await browser.newPage();

    await page.goto(link);

    await page.evaluate(async () => {
      const btn = document.getElementsByClassName('btn primary')[0] as HTMLButtonElement;
      btn?.click();
    });
    await page.waitForSelector('meta[property~="og:image"]');

    const result = await page.evaluate(() => {
      const element = document.querySelector('meta[property~="og:image"]');
      const imgUrl = element && element.getAttribute('content');

      return {
        imgUrl,
      };
    });

    await browser.close();

    if (result.imgUrl) {
      await this.redis.hsetWithExpire(HashUrlParser.ParsedArticles, link, result.imgUrl, dayInS);
    }

    return result;
  }
}
