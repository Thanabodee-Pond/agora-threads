// File: api/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ฟังก์ชันนี้สำหรับ LocalStrategy ใช้
  async validateUser(username: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    // ตามโจทย์คือใช้แค่ username ดังนั้นไม่ต้องเช็ค password
    if (user) {
      return user;
    }
    return null; // ถ้าไม่เจอ user จะ return null
  }

  // ฟังก์ชันนี้สำหรับ AuthController ใช้
  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // ฟังก์ชันนี้สำหรับ AuthController ใช้
  async register(username: string) {
    let user = await this.usersService.findOneByUsername(username);

    // ถ้ายังไม่มี user นี้ ให้สร้างใหม่
    if (!user) {
      user = await this.usersService.create(username);
    }

    // ไม่ว่าจะ userเก่า หรือ userใหม่ ก็ให้ login และรับ token ไปเลย
    return this.login(user);
  }
}