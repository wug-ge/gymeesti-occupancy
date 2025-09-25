import { Injectable } from '@nestjs/common';
import { ApiAuthService } from './api-auth.service';

@Injectable()
export class ApiClientService {
  constructor(private readonly auth: ApiAuthService) {
  }

  async getClubs() {
    const token = await this.auth.getToken()
    const res = await fetch(process.env.GYMEESTI_API_BASE + '/Clubs/Clubs', {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    return await res.json()
  }

  async getWhoIsInCount() {
    const token = await this.auth.getToken()
    const res = await fetch(process.env.GYMEESTI_API_BASE + '/Clubs/WhoIsInCount', {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    return await res.json()
  }
}
