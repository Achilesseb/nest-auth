import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { DUMMY_ENUMS } from 'src/constants/dummyVariables';
import { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get(DUMMY_ENUMS.JWT_REFRESH_SECRET),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(req: Request, { email }: { email: string }) {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    try {
      const user = await this.authService.validateRefreshToken(
        refreshToken,
        email,
      );
      console.log('Succesfully validated refresh token.', user);
      return user;
    } catch (err) {
      console.log('Error trying to validate refresh token.', err);
      throw err;
    }
  }
}
