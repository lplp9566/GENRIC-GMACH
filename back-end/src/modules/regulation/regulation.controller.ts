import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RegulationService } from './regulation.service';
import { RegulationEntity } from './entity/regulation.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
@Controller('regulation')
@UseGuards(JwtAuthGuard)
export class RegulationController {
    constructor (
        private readonly regulationService: RegulationService
    ) {}
    @UseGuards(AdminGuard)
    @Post()
    async updateOrCreateRegulation(@Body() regulation: string): Promise<RegulationEntity> {
        return await this.regulationService.updateOrCreateRegulation(regulation);
    }
    @Get()
    async getRegulation(): Promise<RegulationEntity[]> {
        return await this.regulationService.getRegulation();
    }
}
