import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipRoleEntity } from './Entity/membership_rols.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MembershipRolesService {
    constructor(
        @InjectRepository(MembershipRoleEntity)
        private readonly membershipRolesRepository: Repository<MembershipRoleEntity>,
    ) {}
    async getAllMemberShip() {
        return await this.membershipRolesRepository.find();
    }
    async createMemberShip(name: string) {
        return await this.membershipRolesRepository.save({ name });
    }
}
