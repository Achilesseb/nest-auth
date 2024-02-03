import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from 'src/users/dto/create-user.input';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @Mutation(() => User)
  signUp(@Args('signUp') args: CreateUserInput) {
    this.authService.signUp(args);
  }
}
