import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: string;
  @Expose()
  name: string;

  password: string;
}
