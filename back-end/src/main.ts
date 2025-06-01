// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule }   from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀  Server ready at http://localhost:${port}`);

}

bootstrap();
