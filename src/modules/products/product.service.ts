import { Inject, Injectable } from '@nestjs/common';
import { ResourceService } from '../core/resource.service';
import { Product } from './product';
import { Model } from 'mongoose';

@Injectable()
export class ProductService extends ResourceService<Product> {
  constructor(
    @Inject('PRODUCT_MODEL')
    private readonly productModel: Model<Product>,
  ) {
    super(productModel, 'Product');
  }

  public async findBySku(sku: string): Promise<Product | null> {
    return (await this.productModel
      .findOne({ sku, deleted: false })
      .lean()) as Product | null;
  }

  public async findByCategory(category: string): Promise<Product[]> {
    return (await this.productModel
      .find({ category, deleted: false, isActive: true })
      .lean()) as Product[];
  }

  public async updateInventory(
    productId: string,
    quantity: number,
  ): Promise<Product> {
    const product = await this.findResource(productId);
    return this.update(productId, { quantity }, product);
  }

  public async softDelete(productId: string): Promise<Product> {
    const product = await this.findResource(productId);
    return this.update(productId, { deleted: true, isActive: false }, product);
  }
}
