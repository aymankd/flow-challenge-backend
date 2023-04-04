import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectConnection('default') private readonly connection: Connection,
  ) {}

  getDbHandle(): Connection {
    return this.connection;
  }
}
