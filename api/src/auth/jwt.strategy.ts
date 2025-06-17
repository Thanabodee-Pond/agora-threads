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
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('Fatal Error: JWT_SECRET is not defined in the environment variables');
    }

  super({
   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
   ignoreExpiration: false,
   secretOrKey: secret, 
  });
 }

  async validate(payload: { sub: string; username: string }): Promise<User> { 
    const userId = parseInt(payload.sub, 10);
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found or invalid token.');
    }

    return user; 
  }
}