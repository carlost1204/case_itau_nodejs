import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf((info) => {
              const { timestamp, level, message, context, ...meta } = info;

              // If message is an object (passed from interceptor), use it as base
              const logContent = typeof message === 'object' ? message : { message };

              const finalLog = {
                timestamp,
                service: 'case-itau-backend',
                // Use event from logContent if exists, otherwise use context or default
                event: (logContent as any).event || context || 'system-event',
                logLevel: level.toUpperCase(),
                ...logContent,
                ...meta,
              };

              return JSON.stringify(finalLog);
            })
          ),
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
