import { Module } from '@nestjs/common';
import { ApiAuthService } from './api-auth.service';
import { ApiClientService } from './api-client.service';

@Module({
  providers: [ApiAuthService, ApiClientService],
  exports: [ApiAuthService, ApiClientService],
})
export class ApiModule {}
