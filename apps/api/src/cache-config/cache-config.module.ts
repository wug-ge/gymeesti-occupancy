import KeyvRedis, { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [
            createKeyv(`redis://${process.env.REDIS_HOST || 'localhost' }:${process.env.REDIS_PORT || '6379'}`),
          ],
        };
      },
    })
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}
