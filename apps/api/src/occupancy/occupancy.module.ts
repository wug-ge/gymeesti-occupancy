import { Module } from '@nestjs/common';
import { OccupancyController } from './occupancy.controller';
import { OccupancyService } from './occupancy.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CacheConfigModule } from 'src/cache-config/cache-config.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Module({
  imports: [
    PrismaModule,
    CacheConfigModule,
  ],
  controllers: [OccupancyController],
  providers: [OccupancyService, { provide: APP_INTERCEPTOR, useClass: CacheInterceptor }],
  exports: [OccupancyService],
})
export class OccupancyModule {}
