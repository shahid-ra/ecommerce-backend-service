import { BaseModel } from '../core/base.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Product extends BaseModel {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 0 })
  quantity: number;

  @Prop()
  sku: string;

  @Prop()
  category: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
