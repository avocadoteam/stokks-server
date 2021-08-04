import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { UserAccount } from 'src/db/client/tables/UserAccount';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserAccount)
    private readonly ua: Repository<UserAccount>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(userId: number, pass: string) {
    const user = await this.ua.findOne(userId);
    if (user) {
      const isMatch = await compare(pass, user.passHash.toString('utf8'));
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
    return this.jwtService.sign(payload);
  }
}
