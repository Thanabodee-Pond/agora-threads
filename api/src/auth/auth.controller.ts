// File: api/src/auth/auth.controller.ts
import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ใช้ "AuthGuard('local')" เพื่อเรียกใช้ LocalStrategy ที่เราสร้าง
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    // req.user จะเป็นข้อมูล user ที่ได้จาก validate() ใน LocalStrategy
    return this.authService.login(req.user);
  }

  // Endpoint นี้สำหรับสร้าง User ใหม่ หรือจะใช้ login สำหรับ user เก่าก็ได้
  // ตามโจทย์ที่ว่า "มีแค่ username" เราจะใช้ endpoint นี้คล้ายๆกับการ "Sign in / Sign up" ในตัวเดียว
  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto.username);
  }
}