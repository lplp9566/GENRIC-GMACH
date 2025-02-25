import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async createUser(@Body() userData: Partial<UserEntity>) {
       return this.usersService.createUser(userData); 
    }
}
