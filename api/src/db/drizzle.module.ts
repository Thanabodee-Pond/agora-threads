// File: api/src/db/drizzle.module.ts
import { Module } from '@nestjs/common';
import { DrizzleProvider } from './drizzle.provider';

@Module({
  providers: [DrizzleProvider],
  exports: [DrizzleProvider], // Export DrizzleProvider เพื่อให้ Module อื่นนำไปใช้ได้
})
export class DrizzleModule {}