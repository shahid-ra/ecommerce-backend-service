import { ORMConfig } from '../ormconfig';
import * as mongoose from 'mongoose';

const ormConfig = new ORMConfig();

export const mongoDbProviders = [
  {
    provide: 'MONGO_DATABASE_CONNECTION',
    useFactory: (): unknown =>
      mongoose.createConnection(process.env.MONGO_DB_URI as string, {
        ...ormConfig.getMongodbConfig(),
        ...{
          dbName: process.env.MONGO_DB_NAME,
        },
      }),
  },
];
