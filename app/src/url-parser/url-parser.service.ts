import { UrlParseResponse } from '@models';
import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class UrlParserService {
  async getArticleImg(link: string): Promise<UrlParseResponse> {
    console.debug('run url parser');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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

    browser.close();

    return result;
  }
}
