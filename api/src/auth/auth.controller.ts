import { Controller, Post, UseGuards, Request, Body, BadRequestException, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto'; 

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register') 
  @HttpCode(HttpStatus.OK) 
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerOrLogin(
      createUserDto.username,
    );
  }
}