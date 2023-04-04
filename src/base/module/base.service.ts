import { FilterQuery, UpdateQuery, Types, SortOrder } from 'mongoose';
import { BaseRepository } from './base.repository';

export class BaseService<
  Base,
  BaseDocument,
  SuperBaseRepository extends BaseRepository<Base, BaseDocument>,
> {
  constructor(private readonly superBaseRepository: SuperBaseRepository) {}

  async create(createBaseDto: Base) {
    return this.superBaseRepository.create(createBaseDto);
  }

  findAll(
    filter: FilterQuery<Base> = {},
    sortOptions:
      | string
      | {
          [key: string]: SortOrder;
        } = {},
  ) {
    return this.superBaseRepository.findAll(filter, sortOptions);
  }

  async findOne(filter: FilterQuery<Base>) {
    return this.superBaseRepository.findOne(filter);
  }

  async findById(id: string | Types.ObjectId, expand?: string) {
    return this.superBaseRepository.findById(id, expand);
  }

  async updateOne(id: string, updateBaseDto: UpdateQuery<BaseDocument>) {
    return this.superBaseRepository.update(id, updateBaseDto);
  }

  async updateMany(
    filter: FilterQuery<Base>,
    updateBaseDto: UpdateQuery<BaseDocument>,
  ) {
    return this.superBaseRepository.updateMany(filter, updateBaseDto);
  }

  remove(id: string) {
    return this.superBaseRepository.remove(id);
  }
}
