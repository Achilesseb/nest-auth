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

  private async createRefreshToken(email: string) {
    const tokenId = crypto.createHash(
      this.configService.get(DUMMY_ENUMS.HASH_ALGORITHM),
    );

    return tokenId.update(email).digest('hex');
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

  async signUp(args: SingUpInput) {
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

    return this.usersService.create(newUserData);
  }

  async signIn(user: User) {
    try {
      const token = await this.createAccessToken(user.email);
      const refreshToken = await this.createRefreshToken(user.email);

      if (!token) {
        throw new InternalServerErrorException();
      }

      this.refreshTokenRepository.upsert(
        {
          user,
          refresh_token: await this.hashField(refreshToken),
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

  async validateRefreshToken(token: string, user: string) {
    const storedRefreshToken = await this.refreshTokenRepository.findOne({
      where: { id: user },
      relations: ['user'],
    });

    console.log(storedRefreshToken);
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
