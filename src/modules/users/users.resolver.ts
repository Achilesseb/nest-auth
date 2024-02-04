import { Resolver, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'getAllUsers' })
  @UseGuards(JWTAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }
}
