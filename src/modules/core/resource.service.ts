import { Inject, LoggerService } from '@nestjs/common';
import { BaseModel, FindOptions } from './base.model';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  FieldError,
  NotFoundError,
  ResourceError,
} from 'src/errors/resource-error';
import Joi, { ValidationErrorItem } from 'joi';
import mongoose, { Model } from 'mongoose';
import { Json } from './json';

export abstract class ResourceService<T extends BaseModel> {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  public readonly logger: LoggerService;

  constructor(
    private readonly _model: Model<T>,
    private readonly resourceName: string,
    private readonly __validationSchema?: Joi.Schema,
  ) {}

  public async findResources(
    filters: Json,
    options?: FindOptions,
  ): Promise<T[]> {
    if (
      options?.filterNeedsToBePrinted ||
      options?.filterNeedsToBePrinted === undefined
    ) {
      this.logger.log(
        `Finding resources with filters: ${JSON.stringify(filters)} with resource: ${this.resourceName}`,
      );
    }
    let resources = (await this._model
      .find(filters as any, options?.projections)
      .skip(options?.offset || 0)
      .limit(options?.limit || 10)
      .sort(options?.sort)
      .lean(true)
      .exec()) as T[];
    if (resources?.length && options?.detailed) {
      resources = await this.getDetailedResources(resources, options);
    }

    resources = resources?.map((resource: T) => {
      return this.appendResourceId(resource);
    });

    if (resources?.length && !options?.skipTransformation) {
      resources = this.transformResources(resources);
    }
    return resources;
  }

  public countResources(filters: Json): Promise<number> {
    return this._model.countDocuments(filters as any);
  }

  public async findResource(
    resourceId: string,
    options?: FindOptions,
  ): Promise<T> {
    let resource = (await this._model
      .findById(resourceId, options?.projections)
      .lean()) as T | null;

    if (!resource) {
      throw new NotFoundError(
        `Resource not found for resourceId: ${resourceId} and resource: ${this.resourceName}`,
      );
    }

    if (options?.detailed) {
      resource = (await this.getDetailedResources([resource], options))[0];
    }

    resource = this.appendResourceId(resource);

    if (!options?.skipTransformation) {
      resource = this.transformResource(resource);
    }

    return resource;
  }

  public transformResources(results: T[]): T[] {
    const records = results?.map((record: any) => {
      return this.transformResource(record);
    });
    return records;
  }

  public appendResourceId(result: any): T {
    if (result) {
      const r = { id: String(result._id) };
      delete result._id;
      delete result.__v;
      const resource: T = {
        ...r,
        ...result,
      } as unknown as T;
      return resource;
    }
    return result;
  }

  public transformResource(result: any): T {
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getDetailedResources(
    resources: T[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extras?: Json,
  ): Promise<T[]> {
    return resources;
  }

  public async create(
    resource: T,
    transformRequired?: boolean,
    detailed?: boolean,
    skipLogging?: boolean,
  ): Promise<T> {
    try {
      if (!skipLogging) {
        this.logger.log(`Creating resource of type: ${this.resourceName}`);
      }
      await this.beforeCreate(resource);
      if (!skipLogging) {
        this.logger.log(
          `, with data: ${JSON.stringify({ resource, transformRequired })}`,
        );
      }
      await this.validateResource(resource);

      const r: any = resource;
      if (resource.id) {
        r._id = new mongoose.Types.ObjectId(resource.id);
        delete r.id;
      }
      resource = (await new this._model(r).save()).toObject() as T;

      if (detailed) {
        resource = (await this.getDetailedResources([resource]))?.[0];
      }

      transformRequired = transformRequired || transformRequired == undefined;

      resource = this.appendResourceId(resource);

      if (resource && transformRequired) {
        resource = this.transformResource(resource);
      }

      await this.afterCreate(resource);
      return resource;
    } catch (error) {
      if (error.name === 'MongoError' && error.code === 11000) {
        throw new ResourceError(
          `Duplicate value: ${JSON.stringify(error.keyValue)}`,
          [],
        );
      } else {
        throw error;
      }
    }
  }

  public async update(
    resourceId: string,
    input: Json,
    resource?: T,
    transformRequired?: boolean,
    detailed?: boolean,
    skipLogging?: boolean,
  ): Promise<T> {
    try {
      if (!skipLogging) {
        this.logger.log(`Updating resource of type: ${this.resourceName},`);
      }

      resource ??= await this.findResource(resourceId);

      await this.beforeUpdate(resourceId, input, resource);
      if (!skipLogging) {
        this.logger.log(
          `with data: ${JSON.stringify({ resourceId, input, transformRequired })}`,
        );
      }

      const dirtyResponse = {
        ...resource,
        ...input,
      };

      delete dirtyResponse.id;
      await this.validateResource(dirtyResponse);

      let updatedResource: T = dirtyResponse;
      updatedResource = (await this._model
        .findByIdAndUpdate(
          { _id: new mongoose.Types.ObjectId(resourceId) },
          { $set: updatedResource },
          { new: true },
        )
        .lean()) as T;

      updatedResource.id = resourceId;

      if (detailed) {
        updatedResource = (
          await this.getDetailedResources([updatedResource])
        )?.[0];
      }

      resource = this.appendResourceId(resource);

      transformRequired = transformRequired || transformRequired == undefined;

      if (updatedResource && transformRequired) {
        updatedResource = this.transformResource(updatedResource);
      }

      await this.afterUpdate(resourceId, resource, updatedResource, input);
      return updatedResource;
    } catch (error) {
      this.logger.error(`Error updating resource, error: ${error}`);
      if (error.name === 'MongoError' && error.code === 11000) {
        throw new ResourceError(
          `Duplicate value: ${JSON.stringify(error.keyValue)}`,
          [],
        );
      } else {
        throw error;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async beforeCreate(resource: T): Promise<void> {
    resource.createdAt = new Date();
    resource.deleted = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async afterCreate(resource: T): Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/require-await
  public async beforeUpdate(
    resourceId: string,
    input: Json,
    resource: T,
  ): Promise<void> {
    resource.updatedAt = new Date();
  }

  // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unused-vars
  public async afterUpdate(resourceId: string, _oldResource: T, _newResource: T, _input: Json): Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  public async getPassedFilters(req: any): Promise<Json> {
    const filters = { deleted: false };
    return filters;
  }

  public async validateResource(resource: T): Promise<void> {
    if (this.__validationSchema) {
      try {
        await this.__validationSchema.validateAsync(resource, {
          abortEarly: false,
          allowUnknown: true,
        });
      } catch (error: any) {
        this.logger.error(`Error while validating schema:`, error?.stack);
        const fieldErrors: FieldError[] = [];
        if (error.details) {
          const errorDetails: ValidationErrorItem[] = error.details;
          for (const errorDetail of errorDetails) {
            const fe: FieldError = {
              field: errorDetail.context?.key,
              error: errorDetail.message.replaceAll('"', ''),
              value: errorDetail.context?.value,
            };
            fieldErrors.push(fe);
          }
        }
        throw new ResourceError('', fieldErrors);
      }
    }
  }
}
