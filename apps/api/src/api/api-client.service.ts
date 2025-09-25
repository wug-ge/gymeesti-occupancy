import { Injectable } from '@nestjs/common';
import { ApiAuthService } from './api-auth.service';
import { Club, Prisma } from 'generated/prisma';

@Injectable()
export class ApiClientService {
  constructor(private readonly auth: ApiAuthService) {
  }

  async fetchAuthenticated(url: string, init: RequestInit = {}) {
    let token = await this.auth.getToken()

    if (init.headers === undefined) {
      init.headers = {}
    }

    if (!init.headers.hasOwnProperty('Authorization')) {
      init.headers['Authorization'] = `Bearer ${token}`
    }

    let res = await fetch(process.env.GYMEESTI_API_BASE + '/Clubs/Clubs', init);

    // retry with new auth token
    if (!res.ok) {
      init.headers['Authorization'] = `Bearer` + await this.auth.getToken(true)
      res = await fetch(process.env.GYMEESTI_API_BASE + '/Clubs/Clubs', init);
    }
    return res;
  }

  async getClubs(): Promise<Prisma.ClubGetPayload<{include: { address: true }}>[]> {
    const res = await this.fetchAuthenticated(process.env.GYMEESTI_API_BASE + '/Clubs/Clubs');
    return (await res.json()).data
  }

  async getWhoIsInCount() {
    const res = await this.fetchAuthenticated(process.env.GYMEESTI_API_BASE + '/Clubs/WhoIsInCount');
    return await res.json()
  }
}
