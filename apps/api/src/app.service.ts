import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): any {
    return { success: true };
  }
}
