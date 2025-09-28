import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CrawlerModule } from './crawler/crawler.module';
import { BullModule } from '@nestjs/bullmq';
import { ApiModule } from './api/api.module';
import { PrismaModule } from './prisma/prisma.module';
import { OccupancyModule } from './occupancy/occupancy.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '../../.env' }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT as string),
      },
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1500 },
      }
    }),
    CrawlerModule,
    ApiModule,
    PrismaModule,
    OccupancyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
