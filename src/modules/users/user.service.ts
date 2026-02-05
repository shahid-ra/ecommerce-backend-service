import { Inject, Injectable } from '@nestjs/common';
import { ResourceService } from '../core/resource.service';
import { User } from './user';
import { Model } from 'mongoose';

@Injectable()
export class UserService extends ResourceService<User> {
  constructor(
    @Inject('USER_MODEL')
    private readonly userModel: Model<User>,
  ) {
    super(userModel, 'User');
  }

  public async findByEmail(email: string): Promise<User | null> {
    return (await this.userModel.findOne({ email }).lean()) as User | null;
  }
}
