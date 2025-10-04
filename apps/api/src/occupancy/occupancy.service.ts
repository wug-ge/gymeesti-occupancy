import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Club, OccupancyBasePoint } from '@gymeesti-occupancy/types';

@Injectable()
export class OccupancyService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOccupancy(): Promise<any[]> {
    const clubs = await this.prismaService.club.findMany({
      select: {
        id: true,
        clubId: true,
        name: true,
        description: true,
        longitude: true,
        latitude: true,
        isHidden: true,
        qrCodeSuffixConfig: true,
        occupancies: {
          select: {
            count: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' }, // or 'desc' if you prefer
        },
      },
      where: {
        isHidden: false,
      }
    });

    const dtoClubs: Club[] = clubs.map((c) => ({
      ...c,
      occupancies: c.occupancies.map<OccupancyBasePoint>((o) => ({
        count: o.count,
        createdAt: o.createdAt.toISOString(), // ISO is safer than toString()
      })),
    }));

    return clubs
  }
}
