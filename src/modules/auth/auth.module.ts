import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JWTStrategy } from './strategies/jwt.strategy';
import { DatabaseModule } from '../database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { RefreshStrategy } from './strategies/refresh-auth.strategy';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule,
    UsersModule,
    EmailModule,
    TypeOrmModule.forFeature([Token, User]),
  ],
  providers: [
    AuthService,
    AuthResolver,
    JWTStrategy,
    LocalStrategy,
    RefreshStrategy,
  ],
  exports: [AuthService, LocalStrategy, JWTStrategy, RefreshStrategy],
})
export class AuthModule {}
