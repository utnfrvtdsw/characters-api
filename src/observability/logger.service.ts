import pino from 'pino';
import type { LoggerService } from './logger.service.interface';

export const logger: LoggerService = pino({
  level: process.env.LOG_LEVEL || 'debug',
  base: { service: 'characters-api', version: process.env.APP_VERSION || 'dev' },
  redact: ['password'],
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
      },
    },
  }),
});
