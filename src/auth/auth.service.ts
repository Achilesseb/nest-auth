import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_MESSAGES } from 'src/constants/errors';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(args) {
    const { name, password, email } = args;
    console.log(args);
    const user = await this.usersService.findOne(email);

    if (user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    const newUserData = {
      id: uuidv4(),
      email,
      name,
      password: await bcrypt.hash(password, 12),
    };

    return this.usersService.create(newUserData);
  }

  async signIn(user: User) {
    const token = this.jwtService.sign({
      id: user.id,
      name: user.name,
    });

    if (!token) {
      throw new InternalServerErrorException();
    }
    return {
      user,
      token,
    };
  }

  async validateUser(args) {
    const { email, password } = args;
    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_DOESNT_EXISTS);
    }

    const { password: userPassword, ...userReturnData } = user;
    const match = bcrypt.compare(password, userPassword);

    if (!match) return null;

    return userReturnData;
  }
}
