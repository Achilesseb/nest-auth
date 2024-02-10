import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from 'src/modules/users/dto/create-user.input';
import { User } from 'src/modules/users/entities/user.entity';
import { AuthService, MyContext } from './auth.service';
import { AuthSession, SignInInput } from './dto/signIn.input';
import { UseGuards } from '@nestjs/common';
import { GraphQLAuthGuard } from './guards/gql-auth.guard';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @Mutation(() => User)
  signUp(@Args('signUp') args: CreateUserInput) {
    return this.authService.signUp(args);
  }

  @Mutation(() => AuthSession)
  @UseGuards(GraphQLAuthGuard)
  async signIn(
    @Args('signIn') _args: SignInInput,
    @Context() context: MyContext,
  ): Promise<{ user: User }> {
    const user = await this.authService.setAuthContext(context);

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JWTAuthGuard)
  signOut(@Context() context: MyContext): boolean {
    this.authService.unsetAuthContext(context);

    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(RefreshAuthGuard)
  async getNewTokens(@Context() context: MyContext): Promise<boolean> {
    await this.authService.setAuthContext(context);

    console.log('Sending new tokens to the client');
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JWTAuthGuard)
  async changePassword(@Context() context: MyContext): Promise<boolean> {
    await this.authService.setAuthContext(context);

    console.log('Sending new tokens to the client');
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GraphQLAuthGuard)
  async forgotPassword(@Context() context: MyContext): Promise<boolean> {
    await this.authService.setAuthContext(context);

    console.log('Sending new tokens to the client');
    return true;
  }
}
