import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CRAWL_QUEUE } from './crawler.constants';
import { ApiClientService } from 'src/api/api-client.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { createClient } from 'redis';
import { OccupancyService } from 'src/occupancy/occupancy.service';

@Processor(CRAWL_QUEUE, {
  concurrency: 8, // run up to 8 jobs in parallel
})
export class CrawlerProcessor extends WorkerHost {
  constructor(
    private readonly client: ApiClientService,
    private readonly prisma: PrismaService,
    private readonly occupancyService: OccupancyService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {
    super()
  }

  // Called for every job in this queue
  async process(job: Job) {
    switch (job.name) {
      case 'fetchGymeestiData':
        return this.handleFetchGymeestiData(job);
      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  }

  private async handleFetchGymeestiData(job: Job<{ page?: number }>) {
    // If the target API needs headers/auth, add them here
    const clubs = await this.client.getClubs()
    const whoIsInCount = await this.client.getWhoIsInCount()


    await Promise.all(clubs.map((async club => {
      await this.prisma.club.upsert({ 
        where: { clubId: club.id },
        update: {
          name: club.name,
          description: club.description,
          longitude: club.longitude,
          latitude: club.latitude,
          isHidden: club.isHidden,
          qrCodeSuffixConfig: club.qrCodeSuffixConfig,
          address: {
            update: {
              country: club.address?.country || '',
              city: club.address?.city || '',
              postalCode: club.address?.postalCode || null,
              line1: club.address?.line1 || '',
              line2: club.address?.line2 || null,
            },
          },
        },
        create: {
          clubId: club.id,
          name: club.name,
          description: club.description,
          longitude: club.longitude,
          latitude: club.latitude,
          isHidden: club.isHidden,
          qrCodeSuffixConfig: club.qrCodeSuffixConfig,
          address: {
            create: {
              country: club.address?.country || '',
              city: club.address?.city || '',
              postalCode: club.address?.postalCode || null,
              line1: club.address?.line1 || '',
              line2: club.address?.line2 || null,
            },
          },
        },
      })
    })));

    await Promise.all(whoIsInCount.map(async count => {
      await this.prisma.clubOccupancy.create({
        data: {
          clubId: count.clubId,
          count: count.count,
        }
      })
    }))

    this.resetKeys()

    return { clubsFound: clubs.length, whoIsInCountFound: whoIsInCount.length };
  }

  /**
   * Reset all occupancy cache keys in Redis
   */
  async resetKeys() {
    const redis = createClient({ url: `redis://${process.env.REDIS_HOST || 'localhost' }:${process.env.REDIS_PORT || '6379'}` });
    await redis.connect();
    const keys = await redis.keys('/occupancy*');

    for (const key of keys) {
      await redis.del(key);
    }

    await this.occupancyService.warmUpCache(redis);

    await redis.quit();
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(`[crawler] active: ${job.id} ${job.name}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: unknown) {
    console.log(`[crawler] done: ${job.id}`, result);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.error(`[crawler] failed: ${job?.id}`, err.message);
  }
}
