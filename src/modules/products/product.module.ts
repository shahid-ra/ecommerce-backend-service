import { Module } from '@nestjs/common';
import { Connection } from 'mongoose';
import { MongodbModule } from 'src/config/mongodb/mongodb.module';
import { ProductSchema } from './product';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [MongodbModule],
  providers: [
    {
      provide: 'PRODUCT_MODEL',
      useFactory: (connection: Connection) =>
        connection.model('products', ProductSchema),
      inject: ['MONGO_DATABASE_CONNECTION'],
    },
    ProductService,
  ],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
