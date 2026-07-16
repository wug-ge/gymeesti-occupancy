import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { ArchiveInfo, Club, OccupancyBasePoint } from '@gymeesti-occupancy/types';
import { createClient } from 'redis';

@Injectable()
export class OccupancyService {
  constructor(private readonly prismaService: PrismaService) { }

  async getOccupancy(range: string): Promise<any[]> {
    if (range === 'last_week') {
      return this.getLastDaysOccupancies(7)
    } else if (range === 'last_day') {
      return this.getLastDaysOccupancies(1)
    } else if (range === 'last_two_weeks') {
      return this.getLastDaysOccupancies(14)
    }
    return this.getAllTimeOccupancies()
  }

  /**
   * The first and last points in the archive, so the site can tell visitors
   * which period the recorded data actually covers.
   */
  async getArchiveInfo(): Promise<ArchiveInfo> {
    const [firstRecordedAt, lastRecordedAt] = await Promise.all([
      this.getRecordedBound('asc'),
      this.getRecordedBound('desc'),
    ]);

    return {
      firstRecordedAt: firstRecordedAt?.toISOString() ?? null,
      lastRecordedAt: lastRecordedAt?.toISOString() ?? null,
    };
  }

  /**
   * Oldest (`asc`) or newest (`desc`) reading that counted at least one person,
   * or null if nothing was ever recorded.
   *
   * Empty readings are skipped so a tail of zeroes from the API winding down
   * cannot stretch the archive past the last point carrying real signal. Only
   * this bound filters them: zeroes from genuinely quiet hours are real data and
   * still belong in the charts.
   */
  private async getRecordedBound(order: 'asc' | 'desc'): Promise<Date | null> {
    const point = await this.prismaService.clubOccupancy.findFirst({
      select: { createdAt: true },
      orderBy: { createdAt: order },
      where: { count: { gt: 0 }, club: { isHidden: false } },
    });

    return point?.createdAt ?? null;
  }

  /**
   * Counts back from the newest recorded point rather than from today, because
   * collection stopped when GymEesti retired the API: a window anchored to the
   * current date would return an empty archive.
   */
  private async getLastDaysOccupancies(days: number): Promise<Club[]> {
    const lastRecordedAt = await this.getRecordedBound('desc');
    if (!lastRecordedAt) return [];

    const nDaysAgo = new Date(lastRecordedAt);

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
        address: true,
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
    const [firstRecordedAt, lastRecordedAt] = await Promise.all([
      this.getRecordedBound('asc'),
      this.getRecordedBound('desc'),
    ]);

    if (!firstRecordedAt || !lastRecordedAt || lastRecordedAt <= firstRecordedAt) return [];

    const spanSec = (lastRecordedAt.getTime() - firstRecordedAt.getTime()) / 1000;
    let bucketSec = Math.ceil(spanSec / targetPoints);
    // optional floor to ≥ 5 minutes to avoid noise
    // bucketSec = Math.max(bucketSec, 5 * 60);

    const rows = await this.prismaService.$queryRaw<Array<{
      id: number;
      clubId: number;
      name: string;
      description: string;
      isHidden: boolean;
      qrCodeSuffixConfig: string | null;
      line1: string | null;
      city: string | null;
      postalCode: string | null;
      country: string | null;
      bucketStart: Date;
      createdAt: Date;
      avgCount: number;
    }>>`
    SELECT
      c.id,
      c."clubId",
      c."name",
      c."description",
      a.*,
      date_bin(make_interval(secs => ${bucketSec}), co."createdAt", '1970-01-01'::timestamp) AS "bucketStart",
      AVG(co."count") AS "avgCount"
      FROM "ClubOccupancy" co
      JOIN "Club" c ON c."clubId" = co."clubId"
      LEFT JOIN "Address" a ON a."clubId" = c."id"
      WHERE c."isHidden" = false
        AND co."createdAt" BETWEEN ${firstRecordedAt} AND ${lastRecordedAt}
      GROUP BY
        c.id, c."clubId", c."name", c."description", c."longitude",
        "bucketStart", a.id, a."line1", a."line2", a."city", a."postalCode", a."country"
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
          address: { city: row.city, country: row.country, line1: row.line1, postalCode: row.postalCode },
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

  async warmUpCache(redis: ReturnType<typeof createClient>) {
    const ranges = ['last_day', 'last_two_weeks', 'last_week', 'all_time'];

    for (const range of ranges) {
      const key = `/occupancy?range=${range}`;
      const exists = await redis.exists(key);
      if (!exists) {
        const data = await this.getOccupancy(range);
        await redis.set(key, JSON.stringify({ value: data }), { PX: 600000 }); // 10 minutes TTL
      }
    }
  }
}
