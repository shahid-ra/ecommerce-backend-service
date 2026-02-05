import { Prop } from '@nestjs/mongoose';
import { Json } from './json';

export class BaseModel {
  _id?: string;

  id?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deleted?: boolean;
}

export interface FindOptions {
  projections?: Json;
  offset?: number;
  limit?: number;
  sort?: Json;
  detailed?: boolean;
  isStaleOk?: boolean;
  source?: string;
  completeDependentResourceRequired?: boolean;
  filterNeedsToBePrinted?: boolean;
  skipTransformation?: boolean;
}
