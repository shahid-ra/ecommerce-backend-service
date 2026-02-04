import { Module } from '@nestjs/common';
import { mongoDbProviders } from './mongodb.provider';

@Module({
  providers: [...mongoDbProviders],
  exports: [...mongoDbProviders],
})
export class MongodbModule {}
