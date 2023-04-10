import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StocksController } from '../modules/stock/stock.controller';
import * as request from 'supertest';
import { StocksService } from '../modules/stock/stock.service';
import { Message, TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let app: INestApplication;
  const stocksService = {
    getStocksByMonth: jest.fn(),
  };

  beforeAll(async () => {
    const AppModule: TestingModule = await Test.createTestingModule({
      controllers: [StocksController],
      providers: [{ provide: StocksService, useValue: stocksService }],
    }).compile();
    app = AppModule.createNestApplication();
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });
  describe('get request', () => {
    it('should get Data with transformed format', async () => {
      const data = [];
      stocksService.getStocksByMonth.mockImplementation(() => data);
      const response = await request(app.getHttpServer()).get('/stocks');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        message: Message.FOUND,
        statusCode: 200,
        data,
      });
    });
  });
});
