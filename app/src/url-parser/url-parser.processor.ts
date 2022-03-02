import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as puppeteer from 'puppeteer';
import { BusEvent } from 'src/contracts/events/bus';
import { JobData, JobName, JobNames, QueueName } from 'src/contracts/queue';
import { HashUrlParser } from 'src/contracts/redis-cache';
import { EventBus } from 'src/events/events.bus';
import { RedisHashService } from 'src/redis-cache/redis-cache.module';
import { dayInS } from 'src/utils/time';

@Processor(QueueName.ArticleParse)
export class UrlParserProcessor {
  private readonly logger = new Logger(UrlParserProcessor.name);
  constructor(private readonly redis: RedisHashService) {}

  @Process(JobNames[QueueName.ArticleParse][JobName.GetImgFromArticle])
  async handleProcess(job: Job<JobData[JobName.GetImgFromArticle]>) {
    this.logger.debug(`Call job ${job.name} with attempt ${job.attemptsMade}`);
    const { url } = job.data;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--js-flags="--max-old-space-size=128"'],
    });
    const page = await browser.newPage();

    await page.goto(url);

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
      await this.redis.hsetWithExpire(HashUrlParser.ParsedArticles, url, result.imgUrl, dayInS);
    }

    EventBus.emit(BusEvent.ArticleParseCompleted, {
      imgUrl: result.imgUrl,
      link: url,
    });
  }
}
