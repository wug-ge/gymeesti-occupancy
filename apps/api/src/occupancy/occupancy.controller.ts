import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { OccupancyService } from './occupancy.service';
import { ArchiveInfo, Club } from '@gymeesti-occupancy/types';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/** The archive is frozen now that nothing is being crawled, so it can be cached hard. */
const ARCHIVE_CACHE_TTL = 86_400_000; // 24 hours

@Controller('occupancy')
export class OccupancyController {
  constructor(private readonly occupancyService: OccupancyService) {
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(ARCHIVE_CACHE_TTL)
  async getOccupancy(@Query('range') range: string): Promise<Club[]> {
    return await this.occupancyService.getOccupancy(range);
  }

  @Get('archive')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(ARCHIVE_CACHE_TTL)
  async getArchive(): Promise<ArchiveInfo> {
    return await this.occupancyService.getArchiveInfo();
  }
}
