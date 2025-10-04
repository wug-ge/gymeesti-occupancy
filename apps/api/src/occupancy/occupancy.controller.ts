import { Controller, Get } from '@nestjs/common';
import { OccupancyService } from './occupancy.service';
import { Club } from '@gymeesti-occupancy/types';

@Controller('occupancy')
export class OccupancyController {
  constructor(private readonly occupancyService: OccupancyService) {
  }

  @Get()
  async getOccupancy(): Promise<Club[]> {
    return await this.occupancyService.getOccupancy();
  }
}
