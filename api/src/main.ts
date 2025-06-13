import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // อนุญาตให้ Next.js frontend เรียกได้
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // ถ้าใช้ cookie/session หรือต้องการส่ง headers เช่น Authorization
  });
  await app.listen(3001); // หรือ port ที่คุณตั้งไว้
}
bootstrap();