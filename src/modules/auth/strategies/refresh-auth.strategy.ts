import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import { DUMMY_ENUMS } from 'src/constants/dummyVariables';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get(DUMMY_ENUMS.JWT_SECRET),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(req, payload) {
    console.log(req, payload);
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    try {
      await this.authService.validateRefreshToken(refreshToken, payload);
    } catch (error) {
      console.log(error);
      throw error; // Or handle errors gracefully (e.g., log, return null)
    }
  }
}
