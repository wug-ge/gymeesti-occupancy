import { Injectable } from '@nestjs/common';
import IORedis from 'ioredis';

@Injectable()
export class ApiAuthService {
  private redis = new IORedis(`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);

  private tokenCacheKey = 'extapi:token';

  async getToken(forceNew = false): Promise<string> {
    const cached = await this.redis.get(this.tokenCacheKey);
    if (cached && ! forceNew) return cached;

    const res = await fetch(process.env.GYMEESTI_API_BASE + '/Authorize/LoginWithEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email: process.env.GYMEESTI_EMAIL,
        password: process.env.GYMEESTI_PASSWORD,
        clientApplicationInfo: {
          type: 'WhiteLabel',
          whiteLabelId: process.env.GYMEESTI_WHITE_LABEL_ID, 
        }
      })
    });


    const { data } = await res.json()


    const token = data.token as string;
    await this.redis.set(this.tokenCacheKey, token, 'EX', 1800);
    return token;
  }

  async refreshToken(): Promise<string> {
    await this.redis.del(this.tokenCacheKey);
    return this.getToken();
  }
}
