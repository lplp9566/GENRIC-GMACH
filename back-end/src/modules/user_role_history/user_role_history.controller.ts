import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRoleHistoryService } from './user_role_history.service';
import { UserRoleHistoryEntity } from './Entity/user_role_history.entity';
export class CreateUserRoleHistoryDto {
  userId: number;
  roleId: number;
  from_date: Date;
}
@Controller('user-role-history')
export class UserRoleHistoryController {
    constructor(
        private readonly userRoleHistoryService: UserRoleHistoryService
    ) {}
    @Get()
    async getAllUserRoleHistory() {
        return await this.userRoleHistoryService.getAllUserRoleHistory();
    }
    @Get(':userId')
    async getUserRoleHistory(@Body()userId: number) {
        return await this.userRoleHistoryService.getUserRoleHistory(userId);
    }
    @Post()
    async createUserRoleHistory(@Body() userRoleHistory: CreateUserRoleHistoryDto) {
        return await this.userRoleHistoryService.createUserRoleHistory(userRoleHistory);
    }

}
