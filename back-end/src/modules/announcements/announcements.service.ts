import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  AnnouncementAudience,
  CreateAnnouncementDto,
} from './dto/create-announcement.dto';
import { AnnouncementEntity } from './entities/announcement.entity';
import { AnnouncementRecipientEntity } from './entities/announcement-recipient.entity';
import { UsersService } from '../users/users.service';
import { MembershipType } from '../users/userTypes';

type AuthUser = {
  sub?: number;
  is_admin?: boolean;
  permission?: 'user' | 'admin_read' | 'admin_write';
};

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(AnnouncementEntity)
    private readonly announcementsRepo: Repository<AnnouncementEntity>,
    @InjectRepository(AnnouncementRecipientEntity)
    private readonly recipientsRepo: Repository<AnnouncementRecipientEntity>,
    private readonly usersService: UsersService,
  ) {}

  async createAnnouncement(dto: CreateAnnouncementDto, adminUser: AuthUser) {
    this.ensureAdmin(adminUser);
    const adminUserId = Number(adminUser?.sub);
    if (!Number.isInteger(adminUserId)) {
      throw new ForbiddenException('Invalid authenticated user');
    }

    const recipientIds = await this.resolveAudienceUserIds(dto);
    if (recipientIds.length === 0) {
      throw new BadRequestException('No users found for the selected audience');
    }

    const title = dto.title?.trim();
    const body = dto.body?.trim();
    if (!body) {
      throw new BadRequestException('Body is required');
    }

    const announcement = await this.announcementsRepo.save(
      this.announcementsRepo.create({
        title: title || null,
        body,
        audience: dto.audience,
        createdByUserId: adminUserId,
      }),
    );

    const deliveredAt = new Date();
    const rows = recipientIds.map((userId) => ({
      announcementId: announcement.id,
      userId,
      deliveredAt,
      readAt: null,
    }));

    // Bulk insert in chunks to avoid oversized queries.
    const chunkSize = 1000;
    for (let i = 0; i < rows.length; i += chunkSize) {
      await this.recipientsRepo.insert(rows.slice(i, i + chunkSize));
    }

    return {
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      audience: announcement.audience,
      createdAt: announcement.createdAt,
      recipientsCount: recipientIds.length,
    };
  }

  async getMyAnnouncements(user: AuthUser) {
    const userId = Number(user?.sub);
    if (!Number.isInteger(userId)) {
      throw new ForbiddenException('Invalid authenticated user');
    }

    const recipients = await this.recipientsRepo.find({
      where: { userId },
      relations: ['announcement'],
    });

    const sortedRecipients = recipients.sort((a, b) => {
      const aTime = a.announcement?.createdAt
        ? new Date(a.announcement.createdAt).getTime()
        : 0;
      const bTime = b.announcement?.createdAt
        ? new Date(b.announcement.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });

    const unreadCount = recipients.filter((r) => !r.readAt).length;

    return {
      unreadCount,
      items: sortedRecipients
        .filter((r) => !!r.announcement)
        .map((r) => ({
        id: r.announcement.id,
        title: r.announcement.title,
        body: r.announcement.body,
        createdAt: r.announcement.createdAt,
        readAt: r.readAt,
        seen: !!r.readAt,
      })),
    };
  }

  async markAsRead(announcementId: string, user: AuthUser) {
    const userId = Number(user?.sub);
    if (!Number.isInteger(userId)) {
      throw new ForbiddenException('Invalid authenticated user');
    }

    const recipient = await this.recipientsRepo.findOne({
      where: { announcementId, userId },
    });

    if (!recipient) {
      throw new NotFoundException('Announcement not found for current user');
    }

    if (recipient.readAt) {
      return {
        announcementId,
        readAt: recipient.readAt,
        seen: true,
        alreadyRead: true,
      };
    }

    const now = new Date();
    await this.recipientsRepo.update({ id: recipient.id }, { readAt: now });

    return {
      announcementId,
      readAt: now,
      seen: true,
      alreadyRead: false,
    };
  }

  async adminGetAnnouncements(dateFrom?: string, dateTo?: string) {
    const where: FindOptionsWhere<AnnouncementEntity> = {};

    if (dateFrom || dateTo) {
      const from = dateFrom ? new Date(`${dateFrom}T00:00:00.000Z`) : null;
      const to = dateTo ? new Date(`${dateTo}T23:59:59.999Z`) : null;

      if (from && Number.isNaN(from.getTime())) {
        throw new BadRequestException('Invalid dateFrom');
      }
      if (to && Number.isNaN(to.getTime())) {
        throw new BadRequestException('Invalid dateTo');
      }

      if (from && to) where.createdAt = Between(from, to);
      else if (from) where.createdAt = MoreThanOrEqual(from);
      else if (to) where.createdAt = LessThanOrEqual(to);
    }

    const announcements = await this.announcementsRepo.find({
      where,
      relations: ['recipients'],
      order: { createdAt: 'DESC' },
    });

    return announcements.map((announcement) => {
      const recipients = announcement.recipients ?? [];
      const totalRecipients = recipients.length;
      const totalSeen = recipients.filter((r) => !!r.readAt).length;
      return {
        id: announcement.id,
        title: announcement.title,
        body: announcement.body,
        audience: announcement.audience,
        createdAt: announcement.createdAt,
        totalRecipients,
        totalSeen,
        totalUnseen: Math.max(0, totalRecipients - totalSeen),
      };
    });
  }

  async getRecipientsStatus(announcementId: string) {
    const announcementExists = await this.announcementsRepo.exist({
      where: { id: announcementId },
    });
    if (!announcementExists) {
      throw new NotFoundException('Announcement not found');
    }

    const recipients = await this.recipientsRepo.find({
      where: { announcementId },
      relations: ['user'],
      order: { deliveredAt: 'ASC' },
    });

    const items = recipients.map((r) => {
      const first = (r.user?.first_name ?? '').trim();
      const last = (r.user?.last_name ?? '').trim();
      const name = `${first} ${last}`.trim() || null;
      return {
        userId: Number(r.userId),
        name,
        deliveredAt: r.deliveredAt ?? null,
        readAt: r.readAt ?? null,
        seen: !!r.readAt,
      };
    });

    const totalRecipients = items.length;
    const totalSeen = items.filter((i) => i.seen).length;
    const totalUnseen = totalRecipients - totalSeen;

    return {
      announcementId,
      summary: { totalRecipients, totalSeen, totalUnseen },
      items,
    };
  }

  async deleteAnnouncement(announcementId: string) {
    const exists = await this.announcementsRepo.exist({
      where: { id: announcementId },
    });
    if (!exists) {
      throw new NotFoundException('Announcement not found');
    }

    await this.announcementsRepo.delete({ id: announcementId });
    return { id: announcementId, deleted: true };
  }

  private ensureAdmin(user: AuthUser) {
    if (!user?.is_admin && user?.permission !== 'admin_write') {
      throw new ForbiddenException('Admins only');
    }
  }

  private async resolveAudienceUserIds(dto: CreateAnnouncementDto) {
    switch (dto.audience) {
      case AnnouncementAudience.MEMBERS:
        return this.fetchAudienceIdsByMembership(MembershipType.MEMBER);
      case AnnouncementAudience.FRIENDS:
        return this.fetchAudienceIdsByMembership(MembershipType.FRIEND);
      case AnnouncementAudience.ALL:
        return this.fetchAllAudienceIds();
      case AnnouncementAudience.CUSTOM: {
        const ids = Array.from(new Set((dto.userIds ?? []).map(Number))).filter(
          (id) => Number.isInteger(id) && id > 0,
        );
        if (!ids.length) {
          throw new BadRequestException(
            'userIds is required for custom audience',
          );
        }
        const allUsers = await this.usersService.getAllMembersAndFriends();
        const allowedIds = new Set(allUsers.map((u) => Number(u.id)));
        const foundIds = ids.filter((id) => allowedIds.has(id));
        if (!foundIds.length) {
          throw new BadRequestException('No valid users found in userIds');
        }
        return foundIds;
      }
      default:
        throw new BadRequestException('Invalid audience');
    }
  }

  private async fetchAllAudienceIds() {
    const users = await this.usersService.getAllMembersAndFriends();
    return users
      .map((u) => Number(u.id))
      .filter((id) => Number.isInteger(id) && id > 0);
  }

  private async fetchAudienceIdsByMembership(membershipType: MembershipType) {
    const users = await this.usersService.findUsers({
      membershipType,
      isAdmin: false,
    });
    return users
      .map((u) => Number(u.id))
      .filter((id) => Number.isInteger(id) && id > 0);
  }
}
