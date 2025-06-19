import { Controller, Post ,Body, Get} from '@nestjs/common';
import { RegulationService } from './regulation.service';
import { RegulationEntity } from './entity/regulation.entity';
@Controller('regulation')
export class RegulationController {
    constructor (
        private readonly regulationService: RegulationService
    ) {}
    @Post()
    async updateOrCreateRegulation(@Body() regulation: string): Promise<RegulationEntity> {
        return await this.regulationService.updateOrCreateRegulation(regulation);
    }
    @Get()
    async getRegulation(): Promise<RegulationEntity[]> {
        return await this.regulationService.getRegulation();
    }
}
