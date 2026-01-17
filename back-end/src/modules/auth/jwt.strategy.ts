import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.Authentication,
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET') || "secret",
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.userRepo.findOne({
      where: { id: payload?.sub },
      relations: ['payment_details'],
    });

    if (!user) return payload;

    return {
      sub: user.id,
      email: user.email_address,
      is_admin: user.is_admin,
      user,
    };
  }
}
