import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema/qgl'),
      sortSchema: true,
      driver: ApolloDriver,
      context: ({ res, req }) => {
        return { res, req };
      },
    }),
    UsersModule,
    AuthModule,
    JwtModule,
    PassportModule,
    MailerModule,
  ],
})
export class AppModule {
  constructor() {}
}
