import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerProcessor } from './crawler.processor';
import { CRAWL_QUEUE } from './crawler.constants';
import { CrawlerScheduler } from './crawler.scheduler';
import { ApiModule } from 'src/api/api.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CRAWL_QUEUE,
      prefix: 'crawler',
    }),
    ApiModule,
    PrismaModule,
  ],
  providers: [ CrawlerService, CrawlerProcessor, CrawlerScheduler ],
  exports: [ CrawlerService ],
})
export class CrawlerModule {

}
