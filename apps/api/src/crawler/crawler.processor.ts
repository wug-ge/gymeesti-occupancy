import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CRAWL_QUEUE } from './crawler.constants';
import { ApiClientService } from 'src/api/api-client.service';
import { PrismaClient } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor(CRAWL_QUEUE, {
  concurrency: 8, // run up to 8 jobs in parallel
})
export class CrawlerProcessor extends WorkerHost {
  constructor(
    private readonly client: ApiClientService,
    private readonly prisma: PrismaService,
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
    console.log(clubs)
    const whoIsInCount = await this.client.getWhoIsInCount()

    await Promise.all(clubs.map((async club => {
      console.log("description:" , club)
      await this.prisma.club.upsert({ 
        where: { clubId: club.id },
        update: {},
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

    return { clubsFound: clubs.length, whoIsInCountFound: whoIsInCount.length };
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
