import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_MESSAGES } from 'src/constants/errors';
import { User } from 'src/modules/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { SingUpInput } from './dto/signIn.input';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(args: SingUpInput) {
    const { name, password, email } = args;
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
    const token = this.jwtService.sign(
      {
        email: user.email,
        name: user.name,
      },
      {
        secret: this.configService.get('JWT_SECRET'),
      },
    );

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

    if (!match) {
      throw new UnauthorizedException({ message: 'Wrong credentials!' });
    }

    return userReturnData;
  }
}
