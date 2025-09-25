import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CRAWL_QUEUE } from './crawler.constants';

export type CrawlerJob = {
  url: string;
  page?: number;
  extra?: Record<string, unknown>;
};
@Injectable()
export class CrawlerService {
  constructor(@InjectQueue(CRAWL_QUEUE) private readonly queue: Queue) {}

  async enqueueUrl(url: string, opts?: { priority?: number }) {
    return this.queue.add('fetchNumberOfVisitors', { url } as CrawlerJob, {
      priority: opts?.priority ?? 1,
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }
}
