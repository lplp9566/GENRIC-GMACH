import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleHistoryEntity } from './Entity/user_role_history.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/user.entity';
import { CreateUserRoleHistoryDto } from './user_role_history.controller';
import { MembershipRolesService } from '../membership_roles/membership_roles.service';

@Injectable()
export class UserRoleHistoryService {
  constructor(
    @InjectRepository(UserRoleHistoryEntity)
    private readonly userRoleHistoryRepo: Repository<UserRoleHistoryEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly membershipRolesService: MembershipRolesService,
  ) {}
    async createUserRoleHistory(dto: CreateUserRoleHistoryDto) {
    // 1. טעינת המשתמש
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new BadRequestException('User not found');

    // 2. טעינת הדרגה
    const role = await this.membershipRolesService.findById(dto.roleId);
    if (!role) throw new BadRequestException('Role not found');

    // 3. עדכון current_role בטבלת users
    await this.usersService.setCurrentRole(user.id, role.id);

    // 4. יצירת היסטוריית הדרגה
    const history = this.userRoleHistoryRepo.create({
      user,
      role,
      from_date: dto.from_date,
    });

    return this.userRoleHistoryRepo.save(history);
  }
  // async getUserRoleHistory(userId: number) {
  //     return await this.userRoleHistoryRepo.find({ where: { user: userId } });
  // }
  async getUserRoleHistory(userId: number) {
    const user = await this.usersService.getUserById(userId);
    return await this.userRoleHistoryRepo.find({ where: { user } });
  }
  async getAllUserRoleHistory() {
    return await this.userRoleHistoryRepo.find();
  }
}
