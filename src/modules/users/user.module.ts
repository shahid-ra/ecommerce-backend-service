import { Module } from '@nestjs/common';
import { Connection } from 'mongoose';
import { MongodbModule } from 'src/config/mongodb/mongodb.module';
import { UserSchema } from './user';
import { UserService } from './user.service';

@Module({
  imports: [MongodbModule],
  providers: [
    {
      provide: 'USER_MODEL',
      useFactory: (connection: Connection) =>
        connection.model('users', UserSchema),
      inject: ['MONGO_DATABASE_CONNECTION'],
    },
    UserService,
  ],
  exports: [UserService],
})
export class UserModule {}
