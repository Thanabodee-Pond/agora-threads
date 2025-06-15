// File: api/src/users/users.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_ORM_TOKEN } from '../db/drizzle.provider';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
// [แก้ไข] Path การ import DTO ให้ถูกต้อง และ DTO ไม่มี password แล้ว
import { CreateUserDto } from './dto/create-user.dto';

type DbInstance = typeof db;

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE_ORM_TOKEN) private drizzle: DbInstance) {}

  async create(userData: Pick<CreateUserDto, 'username'>) { // เปลี่ยน Type ให้รับแค่ username
    // [แก้ไข] โค้ดส่วนนี้ เพราะ CreateUserDto ไม่มี password แล้ว
    const [newUser] = await this.drizzle
      .insert(schema.users)
      .values({ username: userData.username }) // ลบ password ออก
      .returning();
    return newUser;
  }

  async findOneByUsername(username: string) {
    return this.drizzle.query.users.findFirst({
      where: eq(schema.users.username, username),
    });
  }

  async findById(id: number) {
    return this.drizzle.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }
}