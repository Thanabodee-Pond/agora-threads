// File: api/src/auth/auth.controller.ts

import { Controller, Post, UseGuards, Request, Body, BadRequestException, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto'; // DTO นี้ตอนนี้มีแค่ username

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // [แก้ไข] ฟังก์ชัน login จะไม่ใช้ AuthGuard('local') อีกต่อไป
  // เพราะ LocalStrategy ปกติจะใช้ username/password
  // ถ้าต้องการ Login แยกต่างหาก อาจจะต้องสร้าง Custom Strategy ที่รับแค่ Username
  // หรืออาจจะรวม Logic เข้ากับ registerOrLogin ไปเลยก็ได้
  // สำหรับตอนนี้ ผมจะลบคอมเมนต์ @UseGuards และ @Post('login') ออกก่อน
  // หรือถ้ายังต้องการ endpoint /auth/login ที่รับแค่ username ก็สามารถปรับได้
  /*
  @Public()
  @UseGuards(AuthGuard('local')) // LocalStrategy จะต้องถูกปรับให้รับแค่ username ด้วย
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
  */

  // --- [ เปลี่ยนแปลง register endpoint ให้เป็น Get or Create and Login ] ---
  @Public()
  @Post('register') // Endpoint นี้จะทำหน้าที่เป็น "Get or Create and Login"
  @HttpCode(HttpStatus.OK) // ใช้ 200 OK เพราะเป็นได้ทั้งการสร้างและล็อกอิน
  async register(@Body() createUserDto: CreateUserDto) {
    // DTO validation จะจัดการเรื่อง username required ให้แล้ว
    return this.authService.registerOrLogin(
      createUserDto.username,
    );
  }
}