import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow CORS for localhost:3003
  app.enableCors({
    origin: 'http://localhost:3003',
  });

  const config = new DocumentBuilder()
    .setTitle('VenCura API')
    .setDescription('Custodial Wallet API')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
