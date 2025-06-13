// File: api/src/users/users.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_ORM_TOKEN } from '../db/drizzle.provider';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

// บอกใบ้ Type ของ db instance
type DbInstance = typeof db;

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE_ORM_TOKEN) private drizzle: DbInstance) {}

  async create(username: string) {
    // .values() รับ object ที่มี key ตรงกับ column ใน schema
    const [newUser] = await this.drizzle
      .insert(schema.users)
      .values({ username: username })
      .returning();
    return newUser;
  }

  async findOneByUsername(username: string) {
    return this.drizzle.query.users.findFirst({
      where: eq(schema.users.username, username),
    });
  }
}