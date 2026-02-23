import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @UseGuards(AdminGuard)
  @Post()
  createAnnouncement(@Body() dto: CreateAnnouncementDto, @Req() req: any) {
    return this.announcementsService.createAnnouncement(dto, req.user);
  }

  @UseGuards(AdminGuard)
  @Get()
  adminGetAnnouncements(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.announcementsService.adminGetAnnouncements(dateFrom, dateTo);
  }

  @Get('my')
  getMyAnnouncements(@Req() req: any) {
    return this.announcementsService.getMyAnnouncements(req.user);
  }

  @Post(':id/read')
  markAsRead(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.announcementsService.markAsRead(id, req.user);
  }

  @UseGuards(AdminGuard)
  @Get(':id/recipients')
  getRecipientsStatus(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.announcementsService.getRecipientsStatus(id);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  deleteAnnouncement(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.announcementsService.deleteAnnouncement(id);
  }
}
