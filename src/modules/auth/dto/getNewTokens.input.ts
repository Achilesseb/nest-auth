import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class GetNewTokensInput {
  @Field()
  @IsString()
  refreshToken: string;
}
