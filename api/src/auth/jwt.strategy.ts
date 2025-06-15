// File: api/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../db/schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
 constructor(
  private configService: ConfigService,
  private usersService: UsersService,
 ) {
    // [แก้ไข 1/2] ตรวจสอบค่า JWT_SECRET ก่อนใช้งาน เพื่อแก้ error
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('Fatal Error: JWT_SECRET is not defined in the environment variables');
    }

  super({
   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
   ignoreExpiration: false,
   secretOrKey: secret, // ใช้ secret ที่ตรวจสอบแล้ว
  });
 }

  // [แก้ไข 2/2] แก้ไข Return Type ให้ถูกต้อง
  async validate(payload: { sub: string; username: string }): Promise<User> { // เปลี่ยนเป็น Promise<User>
    const userId = parseInt(payload.sub, 10);
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found or invalid token.');
    }

    // ลบบรรทัดนี้ออก: const { password, ...result } = user;
    return user; // คืน user โดยตรง (ซึ่งตอนนี้ไม่มี password แล้ว)
  }
}