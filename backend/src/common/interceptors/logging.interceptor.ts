import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Global interceptor for structured logging (Observability).
 *
 * @remarks
 * This interceptor captures every HTTP request/response cycle and logs key metrics
 * in a JSON format compatible with Splunk/ELK.
 *
 * Metrics captured:
 * - Latency (responseTimeMs)
 * - HTTP Status (success/failure)
 * - User Context (userId inferred from token/body/params)
 * - Network Info (IP Address)
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    const { method, url, ip } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTimeMs = Date.now() - now;
          const statusCode = res.statusCode;

          const logPayload = {
            event: `${method} ${url}`,
            userId: req.user?.id || req.body?.receiverId || req.params?.id || null,
            status: statusCode >= 400 ? 'failure' : 'success',
            ipAddress: ip || req.connection.remoteAddress,
            responseTimeMs,
          };

          this.logger.log(logPayload);
        },
        error: (error) => {
          const responseTimeMs = Date.now() - now;
          const statusCode = error.status || 500;

          const logPayload = {
            event: `${method} ${url}`,
            userId: req.user?.id || req.body?.receiverId || req.params?.id || null,
            status: 'failure',
            error: error.message,
            ipAddress: ip || req.connection.remoteAddress,
            responseTimeMs,
          };

          this.logger.error(logPayload);
        },
      })
    );
  }
}
