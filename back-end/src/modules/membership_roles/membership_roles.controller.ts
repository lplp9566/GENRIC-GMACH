import { Body, Controller, Get, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipRolesService } from './membership_roles.service';

export interface IMembershipRole {
    name :string
}
@Controller('membership-roles')
export class MembershipRolesController {
    constructor(
       private readonly membershipRolesService: MembershipRolesService
    ) {}
    @Get()
    async getAllMemberShip() {
        return await this.membershipRolesService.getAllMemberShip();
    }
    @Get('/with-rates')
    async getAllMemberShipWithRates() {
        return await this.membershipRolesService.getAllMemberShipWithRates();
    }
    @Post()
    async createMemberShip(@Body() dto:IMembershipRole ) {
        return await this.membershipRolesService.createMemberShip(dto.name);
    }
}
