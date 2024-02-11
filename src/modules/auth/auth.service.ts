import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ERROR_MESSAGES } from 'src/constants/errors';
import { User } from 'src/modules/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { SingUpInput } from './dto/signIn.input';
import { DUMMY_ENUMS } from 'src/constants/dummyVariables';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { GraphQLExecutionContext } from '@nestjs/graphql';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Token)
    private refreshTokenRepository: Repository<Token>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async createAccessToken(email: string) {
    return this.jwtService.sign(
      { email },
      {
        expiresIn: this.configService.get(DUMMY_ENUMS.JWT_ACCESS_EXPIRY),
        secret: this.configService.get(DUMMY_ENUMS.JWT_SECRET),
      },
    );
  }

  private async createRefreshToken(id: string) {
    return this.jwtService.sign(
      { id },
      {
        expiresIn: this.configService.get(DUMMY_ENUMS.JWT_REFRESH_EXPIRY),
        secret: this.configService.get(DUMMY_ENUMS.JWT_REFRESH_SECRET),
      },
    );
  }

  private hashField(field: string) {
    return bcrypt.hash(
      field,
      -(-this.configService.get(DUMMY_ENUMS.HASH_ROUNDS)),
    );
  }

  private setCookie(context: MyContext, token: string, type?: string) {
    let key = DUMMY_ENUMS.ACCESS_TOKEN;
    let expiry = DUMMY_ENUMS.COOKIE_ACCESS_EXPIRY;

    if (type === 'refresh') {
      (key = DUMMY_ENUMS.REFRESH_TOKEN),
        (expiry = DUMMY_ENUMS.COOKIE_REFRESH_EXPIRY);
    }

    context.res.cookie(key, token, {
      expires: new Date(Date.now() - -this.configService.get(expiry)),
      sameSite: true,
      httpOnly: true,
    });
  }

  private stringToCharCodeArray(stringValue: string) {
    return stringValue.split('').map((char) => char.charCodeAt(0));
  }

  private timeConstantComparison(value: string, compareValue: string) {
    let result: 0 | 1;

    const valueChar = this.stringToCharCodeArray(value);
    const compareValueChar = this.stringToCharCodeArray(compareValue);

    for (let i = 0; i <= value.length; i++) {
      result |= valueChar[i] ^ compareValueChar[i];
    }

    return result === 0;
  }

  async signUp(args: SingUpInput): Promise<User> {
    const { name, password, email } = args;
    const user = await this.usersService.findOne(email);

    if (user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    const newUserData = {
      email,
      name,
      password: await this.hashField(password),
    };

    return this.usersService.create(newUserData) as unknown as User;
  }

  async signIn(user: User) {
    try {
      const token = await this.createAccessToken(user.email);
      const refreshToken = await this.createRefreshToken(user.id);

      if (!token) {
        throw new InternalServerErrorException();
      }

      this.refreshTokenRepository.upsert(
        {
          user,
          refresh_token: crypto
            .createHash(this.configService.get(DUMMY_ENUMS.HASH_ALGORITHM))
            .update(refreshToken)
            .digest('hex'),
        },
        ['user'],
      );

      return {
        user,
        token,
        refreshToken,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  signOut(user: User) {
    try {
      this.refreshTokenRepository.upsert(
        {
          user,
          refresh_token: null,
        },
        ['user'],
      );
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
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

  async validateRefreshToken(token: string, userId: string) {
    try {
      const { refresh_token: storedRefreshToken, user } =
        await this.refreshTokenRepository.findOne({
          where: { id: userId },
          relations: ['user'],
        });

      const hasedRefreshToken = crypto
        .createHash(this.configService.get(DUMMY_ENUMS.HASH_ALGORITHM))
        .update(token)
        .digest('hex');

      const match = this.timeConstantComparison(
        hasedRefreshToken,
        storedRefreshToken,
      );

      if (!match) {
        throw new UnauthorizedException({
          message: ERROR_MESSAGES.INVALID_TOKEN,
        });
      }
      return user;
    } catch (err) {
      console.log(
        'Something went wrong while trying to validate refresh token.',
      );
      throw err;
    }
  }

  async setAuthContext(context: MyContext) {
    const { token, refreshToken, user } = await this.signIn(context.req.user);

    this.setCookie(context, token);
    this.setCookie(context, refreshToken, 'refresh');

    return user;
  }

  async unsetAuthContext(context: MyContext) {
    this.signOut(context.req.user);

    this.setCookie(context, null);
    this.setCookie(context, null, 'refresh');
  }
}

export interface MyContext extends GraphQLExecutionContext {
  req: Request & { user: User | null };
  res: Response;
}
