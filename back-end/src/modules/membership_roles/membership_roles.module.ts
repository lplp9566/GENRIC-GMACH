import { Module } from '@nestjs/common';
import { MembershipRolesController } from './membership_roles.controller';
import { MembershipRolesService } from './membership_roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipRoleEntity } from './Entity/membership_rols.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipRoleEntity])],
  controllers: [MembershipRolesController],
  providers: [MembershipRolesService],
  exports: [MembershipRolesService,TypeOrmModule],
})
export class MembershipRolesModule {}
