import { ObjectType, Field, HideField } from '@nestjs/graphql';

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user' })
@ObjectType()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  @Field(() => String, { description: 'Example field (placeholder)' })
  name: string;

  @HideField()
  @Column()
  @Field(() => String, { description: 'Example field (placeholder)' })
  password: string;

  @Column()
  @Field(() => String, { description: 'Example field (placeholder)' })
  email: string;
}
