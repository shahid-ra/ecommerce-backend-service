import { Module } from '@nestjs/common';
import * as winston from 'winston';
import { DateTimeUtils } from './utils/date-time-utils';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'debug',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({
              format: DateTimeUtils.defaultDateTimeFormat,
            }),
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf((info) => {
              const { timestamp, level, message, ...rest } = info;
              return `${timestamp} : ${level} : ${message} ${
                Object.keys(rest).length ? `${JSON.stringify(rest)}` : ''
              }`;
            }),
          ),
        }),
      ],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
