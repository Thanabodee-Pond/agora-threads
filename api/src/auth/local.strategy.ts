// File: api/src/auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username' }); // บอกให้ Passport รู้ว่าเราจะใช้ field 'username' ในการ login
  }

  async validate(username: string): Promise<any> {
    const user = await this.authService.validateUser(username);
    if (!user) {
      // ในขั้นตอนนี้ เราจะโยน Error ถ้าหา user ไม่เจอ
      // แต่ในอนาคต เราจะเปลี่ยนเป็นสร้าง user ใหม่ให้เลยตามโจทย์
      throw new UnauthorizedException('User not found. Please register first.');
    }
    return user;
  }
}