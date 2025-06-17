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

  async validateUser(username: string): Promise<User | null> {
    const user = await this.usersService.findOneByUsername(username);
    return user || null;
  }

  async login(user: User) { 
    const payload = { username: user.username, sub: user.id };
    return {
      user: user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async registerOrLogin(username: string): Promise<{ user: User; accessToken: string }> {
    let user = await this.usersService.findOneByUsername(username);

    if (user) {
      console.log(`User ${username} already exists. Logging in.`);
      return this.login(user); 
    } else {
      console.log(`Creating new user: ${username}`);
      const newUser = await this.usersService.create({ username }); 

      return this.login(newUser); 
    }
  }
}