import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerProcessor } from './crawler.processor';
import { CRAWL_QUEUE } from './crawler.constants';
import { CrawlerScheduler } from './crawler.scheduler';
import { ApiModule } from 'src/api/api.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CacheConfigModule } from 'src/cache-config/cache-config.module';
import { OccupancyModule } from 'src/occupancy/occupancy.module';
@Module({
  imports: [
    BullModule.registerQueue({
      name: CRAWL_QUEUE,
      prefix: 'crawler',
    }),
    ApiModule,
    PrismaModule,
    CacheConfigModule,
    OccupancyModule,
  ],
  providers: [ CrawlerService, CrawlerProcessor, CrawlerScheduler ],
  exports: [ CrawlerService ],
})
export class CrawlerModule {

}
