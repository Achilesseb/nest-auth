import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/modules/users/entities/user.entity';

import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users_tokens' })
@ObjectType()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    nullable: true,
    unique: true,
  })
  @Field()
  refresh_token: string;
}
