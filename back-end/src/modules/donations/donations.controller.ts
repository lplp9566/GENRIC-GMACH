import { Body, Controller, Post } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsEntity } from './donations.entity';

@Controller('donations')
export class DonationsController {
    constructor(
        private readonly donationsService: DonationsService,
    ) {}
    @Post()
    async createDonation(@Body() donation: DonationsEntity) {
        return this.donationsService.createDonation(donation);
    }
    
}
