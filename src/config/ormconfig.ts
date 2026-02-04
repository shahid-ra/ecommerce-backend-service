import * as dotenv from 'dotenv';
dotenv.config();

export class ORMConfig {
  public getMongodbConfig() {
    return {
      maxPoolSize: Number(process.env.MONGO_DB_MAX_CONNECTIONS) || 15,
      minPoolSize: 1,
      socketTimeoutMS: 60000,
    };
  }
}
