import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  async create(createUserInput: CreateUserInput) {
    return this.usersRepository.save(createUserInput);
  }
  findAll() {
    return this.usersRepository.find() ?? [];
  }
  findOne(email: string) {
    return this.usersRepository.findOneBy({ email });
  }
}
