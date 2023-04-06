import { CommandFactory } from 'nest-commander';
import { AppModule } from './app/app.module';

async function bootstrap() {
  console.log('Commander Loading...');
  await CommandFactory.run(AppModule);
}

bootstrap();
