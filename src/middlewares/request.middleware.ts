import { Inject, LoggerService, NestMiddleware } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ulid } from 'ulid';

export class RequestMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  use(req: any, res: any, next: (error?: any) => void) {
    const originalUrl = req?.raw
      ? req?.raw?.url
      : req?.originalUrl || req?.headers['originalUrl'] || req?.url;
    const requestId = req.headers['x-request-id']
      ? req.headers['x-request-id']
      : ulid(Date.now());
    this.logger.log(
      `RequestMiddleware:logging request for url:${originalUrl} and method:${req?.method} and requestId:${requestId}, with data: ${JSON.stringify(req.body)} or params: ${JSON.stringify(req.params)} or query: ${JSON.stringify(req.query)}`,
    );
    req.headers['x-request-id'] = requestId;
    req.headers['x-requested-at'] = Date.now();
    if (next) {
      next();
    }
  }
}
