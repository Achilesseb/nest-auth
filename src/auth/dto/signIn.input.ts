import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class SignInInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  password: string;
}

@ObjectType()
export class AuthSession {
  @Field()
  user: User;

  @Field()
  token: string;
}
