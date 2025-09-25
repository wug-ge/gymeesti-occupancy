import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CRAWL_QUEUE } from './crawler.constants';
import { ApiClientService } from 'src/api/api-client.service';

@Processor(CRAWL_QUEUE, {
  concurrency: 8, // run up to 8 jobs in parallel
})
export class CrawlerProcessor extends WorkerHost {
  constructor(private readonly client: ApiClientService) {
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


    
    console.log(JSON.stringify(clubs))
    console.log(JSON.stringify(whoIsInCount))

    // TODO: transform + persist (DB, S3, etc.)
    // await this.repo.upsertMany(transform(payload));

    return {
      clubs
    };
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
