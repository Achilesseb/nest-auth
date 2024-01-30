import { Inject, Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@Inject() private usersRepository: Repository<User>) {}
  async create(createUserInput: CreateUserInput) {
    const newUser = {
      id: uuidv4(),
      username: createUserInput.username,
      password: await bcrypt.hash(createUserInput.password, '12'),
    };
    this.usersRepository.create(newUser);
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(username: string) {
    return this.usersRepository.findOneBy({ username });
  }

  // update(id: number, updateUserInput: UpdateUserInput) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
