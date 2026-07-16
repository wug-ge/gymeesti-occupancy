import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CRAWL_QUEUE } from './crawler.constants';

/**
 * GymEesti retired the API this project crawled, so there is nothing left to
 * fetch and the site now serves the recorded archive instead.
 *
 * The schedule lives in Redis rather than in this file, so dropping the old
 * `queue.add` call is not enough on its own: a repeat job registered by an
 * earlier deploy survives restarts and would keep firing against the dead API
 * forever, so it has to be torn down explicitly. The crawler itself is left
 * intact so it can be scheduled again if API access ever comes back.
 */
@Injectable()
export class CrawlerScheduler implements OnModuleInit {
  private readonly logger = new Logger(CrawlerScheduler.name);

  constructor(@InjectQueue(CRAWL_QUEUE) private readonly queue: Queue) {}

  async onModuleInit() {
    const schedulers = await this.queue.getJobSchedulers();

    for (const scheduler of schedulers) {
      await this.queue.removeJobScheduler(scheduler.key);
      this.logger.log(`Removed crawl schedule "${scheduler.key}"`);
    }

    // Drops whatever the old schedule left waiting or in exponential backoff.
    await this.queue.drain(true);
  }
}
