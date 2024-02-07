import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DUMMY_ENUMS } from 'src/constants/dummyVariables';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(DUMMY_ENUMS.JWT_SECRET),
    });
  }

  async validate(payload: any) {
    const { email } = payload;
    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
