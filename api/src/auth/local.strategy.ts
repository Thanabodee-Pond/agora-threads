// // api/src/auth/local.strategy.ts
// import { Strategy } from 'passport-local';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { AuthService } from './auth.service';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(private authService: AuthService) {
//     super({ usernameField: 'username', passwordField: 'password' });
//   }

//   async validate(username: string, password?: string): Promise<any> {
//     if (!password) { // *** ตรวจสอบ password ***
//       throw new UnauthorizedException('Password is required.');
//     }
//     const user = await this.authService.validateUser(username);

//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials.');
//     }
//     return user;
//   }
// }