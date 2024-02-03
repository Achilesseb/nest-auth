import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  async create(createUserInput: CreateUserInput) {
    this.usersRepository.create(createUserInput);
    return 'This action adds a new user';
  }
  findAll() {
    return this.usersRepository.find() ?? [];
  }
  findOne(username: string) {
    return this.usersRepository.findOneBy({ username });
  }
}
