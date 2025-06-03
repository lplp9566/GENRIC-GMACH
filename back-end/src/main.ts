import { NestFactory } from '@nestjs/core';
import { AppModule }   from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: true, 
    credentials: true, 
  });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀  Server ready at http://localhost:${port}`);

}

bootstrap();
