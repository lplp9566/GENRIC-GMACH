import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async createUser(userData: Partial<UserEntity>): Promise<UserEntity> {
    if (!userData.password) {
      throw new Error('Password is required');
    }
  
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
  
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }
  

  async getUserById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async getUserByIdNumber(id_number: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id: Number(id_number) } });
  }
}
