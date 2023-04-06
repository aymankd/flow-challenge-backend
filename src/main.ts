import {
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { MongoExceptionFilter } from './filters/mongo-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

const globalPrefix = 'api';
const defaultVersion = '1';
const port = process.env.PORT || 4444;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupDevEnvironment(app);
  setupGlobalMiddlewares(app);
  setupSwagger(app);
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}/v${defaultVersion}`,
  );
}

export function setupGlobalMiddlewares(app: INestApplication) {
  app.enableCors();
  return app
    .setGlobalPrefix(globalPrefix)
    .useGlobalFilters(new MongoExceptionFilter())
    .useGlobalInterceptors(new TransformInterceptor())
    .enableVersioning({
      type: VersioningType.URI,
      defaultVersion,
    })
    .useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    );
}

export async function setupDevEnvironment(app: INestApplication) {
  if (process.env.NODE_ENV === 'development') {
    const morgan = await import('morgan');
    app.use(
      morgan('dev', {
        stream: {
          write: (message) => Logger.debug(message.replace('\n', '')),
        },
      }),
    );
  }
}

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('flow-challenge API')
    .setDescription('flow-challenge API documentation')
    .setVersion('0.0.1')
    .addBearerAuth({ type: 'http' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

bootstrap();
