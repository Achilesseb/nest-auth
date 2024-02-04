import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
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

  async createAccessToken(userId: string) {
    return this.jwtService.sign(
      { id: userId },
      {
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRY'),
        secret: this.configService.get('JWT_SECRET'),
      },
    );
  }

  async createRefreshToken(userId: string) {
    const tokenId = crypto.createHash('sha256');
    return tokenId.update(userId).digest('hex');
  }

  setCookies(context, { token, refreshToken }) {
    context.res.cookie('access_token', token, {
      expires: new Date(
        Date.now() - -this.configService.get('COOKIE_ACCESS_EXPIRY'),
      ),
      sameSite: true,
      httpOnly: true,
    });

    context.res.cookie('refresh_token', refreshToken, {
      expires: new Date(
        Date.now() - -this.configService.get('COOKIE_REFRESH_EXPIRY'),
      ),
      sameSite: true,
      httpOnly: true,
    });
  }

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
    const token = await this.createAccessToken(user.id);
    const refreshToken = await this.createRefreshToken(user.id);

    if (!token) {
      throw new InternalServerErrorException();
    }
    return {
      user,
      token,
      refreshToken,
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
