import { Controller, Get, Query } from '@nestjs/common';
import { OccupancyService } from './occupancy.service';
import { Club } from '@gymeesti-occupancy/types';

@Controller('occupancy')
export class OccupancyController {
  constructor(private readonly occupancyService: OccupancyService) {
  }

  @Get()
  async getOccupancy(@Query('range') range: string): Promise<Club[]> {
    return await this.occupancyService.getOccupancy(range);
  }
}
