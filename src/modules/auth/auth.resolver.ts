import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from 'src/modules/users/dto/create-user.input';
import { User } from 'src/modules/users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthSession, SignInInput } from './dto/signIn.input';
import { UseGuards } from '@nestjs/common';
import { GraphQLAuthGuard } from './guards/gql-auth.guard';
import { ConfigService } from '@nestjs/config';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}
  @Mutation(() => User)
  signUp(@Args('signUp') args: CreateUserInput) {
    return this.authService.signUp(args);
  }

  @Mutation(() => AuthSession)
  @UseGuards(GraphQLAuthGuard)
  async signIn(@Args('signIn') _args: SignInInput, @Context() context) {
    const { token, refreshToken } = await this.authService.signIn(context.user);

    this.authService.setCookies(context, { token, refreshToken });

    return {
      user: context.user,
    };
  }
}
