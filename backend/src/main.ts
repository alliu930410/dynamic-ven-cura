import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow CORS for localhost:3003
  app.enableCors({
    origin: 'http://localhost:3003',
  });

  await app.listen(3000);
}
bootstrap();
