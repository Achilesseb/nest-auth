import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

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

  async signUp(args) {
    const { username, password, email } = args;
    const user = await this.usersService.findOne(username);

    if (user) {
      throw new BadRequestException('A user with this name already exist.');
    }

    const newUserData = {
      id: uuidv4(),
      email,
      username,
      password: await bcrypt.hash(password, '12'),
    };

    return await this.usersService.create(newUserData);
  }
}
