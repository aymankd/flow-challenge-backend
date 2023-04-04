import {
  FilterQuery,
  Model,
  UpdateQuery,
  Types,
  SortOrder,
  Connection,
  SaveOptions,
  QueryOptions,
} from 'mongoose';

export class BaseRepository<Base, BaseDocument> {
  constructor(
    private readonly baseModel: Model<BaseDocument>,
    private readonly connection: Connection,
  ) {}

  create(
    base: Omit<Base, '_id'>,
    options?: SaveOptions,
  ): Promise<BaseDocument> {
    const createdDocument = new this.baseModel({
      ...base,
      _id: new Types.ObjectId(),
    });
    return createdDocument.save(options) as Promise<BaseDocument>;
  }

  findAll(
    filter: FilterQuery<Base>,
    sortOptions:
      | string
      | {
          [key: string]: SortOrder;
        } = {},
  ): Promise<BaseDocument[]> {
    return this.baseModel.find(filter, null).sort(sortOptions).exec();
  }

  findById(
    id: string | Types.ObjectId,
    expand?: string,
    options?: QueryOptions<BaseDocument>,
  ) {
    const query = this.baseModel
      .findById(id, undefined, options)
      .populate(expand?.split(','));
    return query.exec();
  }

  findOne(filter: FilterQuery<Base>): Promise<BaseDocument> {
    return this.baseModel.findOne(filter).exec();
  }

  update(
    id: string,
    updateBase: UpdateQuery<BaseDocument>,
    options?: QueryOptions<BaseDocument>,
  ): Promise<BaseDocument> {
    return this.baseModel
      .findByIdAndUpdate(id, updateBase, {
        ...options,
        new: true,
      })
      .exec();
  }

  updateMany(
    filter: FilterQuery<Base>,
    updateBase: UpdateQuery<BaseDocument>,
    options?: SaveOptions,
  ) {
    return this.baseModel.updateMany(filter, updateBase, options).exec();
  }

  remove(id: string, options?: SaveOptions): Promise<BaseDocument> {
    return this.baseModel.findByIdAndRemove(id, options).exec();
  }

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
