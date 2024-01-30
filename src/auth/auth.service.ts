import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    if (!user) return null;

    const { password: userPassword, ...userReturnData } = user;
    const match = bcrypt.compare(password, userPassword);

    if (!match) return null;

    const jwtSignData = {
      id: userReturnData.id,
      username: userReturnData.username,
    };

    return {
      token: this.jwtService.sign(jwtSignData),
      user: userReturnData,
    };
  }
}
