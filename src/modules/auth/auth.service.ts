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
import { DUMMY_ENUMS } from 'src/constants/dummyVariables';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async createAccessToken(userId: string) {
    return this.jwtService.sign(
      { id: userId },
      {
        expiresIn: this.configService.get(DUMMY_ENUMS.JWT_ACCESS_EXPIRY),
        secret: this.configService.get(DUMMY_ENUMS.JWT_SECRET),
      },
    );
  }

  private async createRefreshToken(userId: string) {
    const tokenId = crypto.createHash(
      this.configService.get(DUMMY_ENUMS.HASH_ALGORITHM),
    );
    return tokenId.update(userId).digest('hex');
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
    const match = await bcrypt.compare(password, userPassword);

    if (!match) {
      throw new UnauthorizedException({
        message: ERROR_MESSAGES.WRONG_CREDENTIALS,
      });
    }

    return userReturnData;
  }

  async setCookies(context) {
    const { token, refreshToken, user } = await this.signIn(context.user);

    context.res.cookie(DUMMY_ENUMS.ACCESS_TOKEN, token, {
      expires: new Date(
        Date.now() - -this.configService.get(DUMMY_ENUMS.COOKIE_ACCESS_EXPIRY),
      ),
      sameSite: true,
      httpOnly: true,
    });

    context.res.cookie(DUMMY_ENUMS.REFRESH_TOKEN, refreshToken, {
      expires: new Date(
        Date.now() - -this.configService.get(DUMMY_ENUMS.COOKIE_REFRESH_EXPIRY),
      ),
      sameSite: true,
      httpOnly: true,
    });

    return user;
  }
}
