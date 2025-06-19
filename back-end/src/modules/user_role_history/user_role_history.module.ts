import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoleHistoryEntity } from './Entity/user_role_history.entity';
import { MembershipRolesModule } from '../membership_roles/membership_roles.module';
import { UserRoleHistoryService } from './user_role_history.service';
import { UserRoleHistoryController } from './user_role_history.controller';
import { UserEntity } from '../users/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRoleHistoryEntity,UserEntity]),
        forwardRef(() => UsersModule),
        MembershipRolesModule
    ],
    controllers: [UserRoleHistoryController],
    providers: [UserRoleHistoryService],
    exports: [UserRoleHistoryService,TypeOrmModule]
})
export class UserRoleHistoryModule {}
