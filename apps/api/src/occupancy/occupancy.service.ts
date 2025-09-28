import { Injectable } from '@nestjs/common';
import { Club } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OccupancyService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOccupancy(): Promise<Club[]> {
    return await this.prismaService.club.findMany({ include: { occupancies: true }});
  }
}
