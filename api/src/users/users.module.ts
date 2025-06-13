// File: api/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DrizzleModule } from '../db/drizzle.module'; // <-- แก้จาก AppModule เป็น DrizzleModule

@Module({
  imports: [DrizzleModule], // <-- แก้จาก AppModule เป็น DrizzleModule
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}