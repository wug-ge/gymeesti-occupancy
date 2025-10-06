import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Club, OccupancyBasePoint } from '@gymeesti-occupancy/types';

@Injectable()
export class OccupancyService {
  constructor(private readonly prismaService: PrismaService) { }

  async getOccupancy(range: string): Promise<any[]> {
    if (range === 'last_week') {
      return this.getLastDaysOccupancies(7)
    } else if (range === 'last_day') {
      return this.getLastDaysOccupancies(1)
    }
    return this.getAllTimeOccupancies()
  }

  private async getLastDaysOccupancies(days: number): Promise<Club[]> {
    const nDaysAgo = new Date();

    nDaysAgo.setDate(nDaysAgo.getDate() - days);
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
          orderBy: { createdAt: 'asc' },
          where: { createdAt: { gte: nDaysAgo }}
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
    return dtoClubs;
  }

  private async getAllTimeOccupancies(targetPoints = 200): Promise<Club[]> {
    const [bounds] = await this.prismaService.$queryRaw<Array<{
      minTs: number; maxTs: number;
    }>>`
    SELECT
      EXTRACT(EPOCH FROM MIN(co."createdAt")) AS "minTs",
      EXTRACT(EPOCH FROM MAX(co."createdAt")) AS "maxTs"
        FROM "ClubOccupancy" co
        JOIN "Club" c ON c."clubId" = co."clubId"
        WHERE c."isHidden" = false
    `;

    if (!bounds || bounds.maxTs <= bounds.minTs) return [];

    let bucketSec = Math.ceil((bounds.maxTs - bounds.minTs) / targetPoints);
    // optional floor to ≥ 5 minutes to avoid noise
    // bucketSec = Math.max(bucketSec, 5 * 60);

    const rows = await this.prismaService.$queryRaw<Array<{
      id: number;
      clubId: number;
      name: string;
      description: string;
      isHidden: boolean;
      qrCodeSuffixConfig: string | null;
      bucketStart: Date;
      createdAt: Date;
      avgCount: number;
    }>>`
    SELECT
      c.id,
      c."clubId",
      c."name",
      c."description",
      date_bin(make_interval(secs => ${bucketSec}), co."createdAt", '1970-01-01'::timestamp) AS "bucketStart",
      AVG(co."count") AS "avgCount"
        FROM "ClubOccupancy" co
        JOIN "Club" c ON c."clubId" = co."clubId"
        WHERE c."isHidden" = false
        GROUP BY
          c.id, c."clubId", c."name", c."description", c."longitude",
          "bucketStart"
        ORDER BY c."clubId", "bucketStart"
    `;

    const clubs: Club[] = [];
    let current: Club | null = null;

    for (const row of rows) {
      if (!current || current.id !== row.id) {
        if (current) clubs.push(current);
        current = {
          id: row.id,
          clubId: row.clubId,
          name: row.name,
          occupancies: [],
        };
      }
      current.occupancies.push({
        count: Math.round(Number(row.avgCount)),
        createdAt: row.bucketStart.toISOString(),
      });
    }
    if (current) clubs.push(current);

    return clubs;
  }
}
