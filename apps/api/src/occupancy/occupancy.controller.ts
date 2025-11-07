import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { OccupancyService } from './occupancy.service';
import { Club } from '@gymeesti-occupancy/types';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('occupancy')
export class OccupancyController {
  constructor(private readonly occupancyService: OccupancyService) {
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  async getOccupancy(@Query('range') range: string): Promise<Club[]> {
    return await this.occupancyService.getOccupancy(range);
  }
}
