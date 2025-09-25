import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { CRAWL_QUEUE } from './crawler.constants';

@Injectable()
export class CrawlerScheduler implements OnModuleInit {
  constructor(@InjectQueue(CRAWL_QUEUE) private readonly queue: Queue) {}

  async onModuleInit() {
    await this.queue.add(
      'fetchGymeestiData',
      {},
      {
        jobId: 'fetch-gymeesti-data',
        repeat: { pattern: '* * * * *' }, // crawl every 5 minutes
        priority: 2,
      } satisfies JobsOptions,
    );
  }
}
