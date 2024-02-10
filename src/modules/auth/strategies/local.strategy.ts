import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    try {
      const user = await this.authService.validateUser({ email, password });

      if (!user) {
        throw new UnauthorizedException();
      }
      console.log('Succesfully validated user validity.');
      return user;
    } catch (err) {
      console.log('Error trying to validate user.', err);
      throw err;
    }
  }
}
