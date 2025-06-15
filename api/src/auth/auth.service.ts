// File: api/src/auth/auth.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../db/schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // [แก้ไข] ฟังก์ชันนี้ใช้สำหรับตรวจสอบการ Login (ไม่มี password แล้ว)
  // จะคืนค่า User กลับไปเลยถ้าเจอ username
  async validateUser(username: string): Promise<User | null> {
    const user = await this.usersService.findOneByUsername(username);
    // [การแก้ไขที่ 1] เปลี่ยน undefined เป็น null ก่อนคืนค่า
    return user || null;
  }

  // ฟังก์ชันนี้ใช้สำหรับสร้าง Token (ถูกต้องแล้ว)
  async login(user: User) { // เปลี่ยน type ของ user เป็น User (ไม่มี Omit<'password'>)
    const payload = { username: user.username, sub: user.id };
    return {
      user: user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  // --- [ เปลี่ยนแปลงเมธอด register ให้เป็น Get or Create and Login โดยไม่มี password ] ---
  async registerOrLogin(username: string): Promise<{ user: User; accessToken: string }> {
    let user = await this.usersService.findOneByUsername(username);

    if (user) {
      // ถ้า username มีอยู่แล้ว -> ทำการ Login
      console.log(`User ${username} already exists. Logging in.`);
      // ไม่มีการ validate password แล้ว เพราะไม่ใช้ password
      return this.login(user); // Login user ที่มีอยู่แล้ว
    } else {
      // ถ้า username ยังไม่มี -> สร้างผู้ใช้ใหม่และ Login
      console.log(`Creating new user: ${username}`);
      // ไม่ต้อง hash password แล้ว
      const newUser = await this.usersService.create({ username }); // สร้าง user ด้วย username เท่านั้น

      return this.login(newUser); // Login user ที่สร้างใหม่
    }
  }
}