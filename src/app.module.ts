import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import * as winston from 'winston';
import { DateTimeUtils } from './utils/date-time-utils';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from './modules/auth/auth.module';
import { RequestMiddleware } from './middlewares/request.middleware';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { UserModule } from './modules/users/user.module';
import { ProductModule } from './modules/products/product.module';

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
    AuthModule,
    UserModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {
          path: 'auth/login',
          method: RequestMethod.POST,
        },
        {
          path: 'auth/register',
          method: RequestMethod.POST,
        },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
