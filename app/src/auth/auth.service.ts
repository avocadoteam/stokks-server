import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { UserAccount } from 'src/db/client/tables/UserAccount';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(UserAccount)
    private readonly ua: Repository<UserAccount>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(userId: number, pass: string) {
    this.logger.debug(`Looking for user ${userId}`);
    let user: UserAccount | null;
    if (typeof userId === 'string') {
      user = await this.ua.findOneBy({ name: String(userId) });
    } else {
      user = await this.ua.findOneBy({ id: userId });
    }

    if (user) {
      this.logger.debug('Got user');
      const isMatch = await compare(pass, user.passHash.toString('utf8'));
      this.logger.debug(`user pass and hash isMatch ${isMatch}`);

      if (!isMatch) {
        return null;
      }
      return {
        userId: user.id,
      };
    }
    return null;
  }

  async login(user: { userId: number }) {
    const payload = { sub: user.userId };
    return { token: this.jwtService.sign(payload), userId: user.userId };
  }
}
