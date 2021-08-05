import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalAuthGuard.name);
  handleRequest(a: any, b: any, c: any, d: any) {
    this.logger.debug('handleRequest');
    console.debug(a, b, c, d);
    return super.handleRequest(a, b, c, d);
  }
}
