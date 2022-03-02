import { UrlParseResponse } from '@models';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Response } from 'express';
import { BusEvent } from 'src/contracts/events/bus';
import { JobData, JobName, JobNames, QueueName } from 'src/contracts/queue';
import { HashUrlParser } from 'src/contracts/redis-cache';
import { EventBus } from 'src/events/events.bus';
import { RedisHashService } from 'src/redis-cache/redis-cache.module';

@Injectable()
export class UrlParserService {
  constructor(
    private readonly redis: RedisHashService,
    @InjectQueue(QueueName.ArticleParse) private readonly queue: Queue,
  ) {}

  async getArticleImgs(links: string[], res: Response) {
    console.debug('run url parser');

    const cachedLinks: UrlParseResponse[] = [];
    const notCachedLinks: string[] = [];
    const finishedLinks: string[] = [];

    for (const link of links) {
      const cachedImgUrl = await this.redis.hgetField(HashUrlParser.ParsedArticles, link);

      if (cachedImgUrl) {
        console.debug('return from cached');
        cachedLinks.push({ link, imgUrl: cachedImgUrl });
      } else {
        notCachedLinks.push(link);
      }
    }

    cachedLinks.forEach(data => {
      res.write(`link=${data.link};imgUrl=${data.imgUrl};\n`);
      finishedLinks.push(data.link);

      if (finishedLinks.length === links.length) res.end();
    });

    EventBus.on(BusEvent.ArticleParseCompleted, data => {
      res.write(`link=${data.link};imgUrl=${data.imgUrl};\n`);
      finishedLinks.push(data.link);

      if (finishedLinks.length === links.length) res.end();
    });

    for (const notCachedLink of notCachedLinks) {
      const jobData: JobData[JobName.GetImgFromArticle] = { url: notCachedLink };
      await this.queue.add(JobNames[QueueName.ArticleParse][JobName.GetImgFromArticle], jobData);
    }
  }
}
