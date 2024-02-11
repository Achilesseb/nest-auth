// email.service.ts

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendUserWelcome(user: User, token?: string) {
    const confirmation_url = `achilesseb.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Achilesseb! Confirm your Email',
      template: './welcome',
      context: {
        name: user.name,
        confirmation_url,
      },
    });
  }
}
