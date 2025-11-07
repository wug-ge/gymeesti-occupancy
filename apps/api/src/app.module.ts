import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CrawlerModule } from './crawler/crawler.module';
import { BullModule } from '@nestjs/bullmq';
import { ApiModule } from './api/api.module';
import { PrismaModule } from './prisma/prisma.module';
import { OccupancyModule } from './occupancy/occupancy.module';
import { CacheConfigModule } from './cache-config/cache-config.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor } from '@nestjs/cache-manager';

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
    CacheConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_INTERCEPTOR, useClass: CacheInterceptor }],
})
export class AppModule {}
