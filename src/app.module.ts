import { Module } from '@nestjs/common';

import { DatabseModule } from './databse/databse.module';
import { UsersModule } from './users/users.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ApolloDriver } from '@nestjs/apollo';

@Module({
  imports: [
    UsersModule,
    DatabseModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema/qgl'),
      sortSchema: true,
      driver: ApolloDriver,
    }),
    AuthModule,
  ],
})
export class AppModule {
  constructor() {}
}
