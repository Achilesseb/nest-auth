import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';
import { User } from 'src/modules/users/entities/user.entity';

@InputType()
export class SignInInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  password: string;
}

@InputType()
export class SingUpInput extends SignInInput {
  @Field()
  @IsString()
  name: string;
}

@ObjectType()
export class AuthSession {
  @Field()
  user: User;
}
