import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hash, compare } from 'bcrypt';

import { DatabaseService } from '../database/database.service';
import { AuthDTO } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * @description Method for logging in user
   */
  async signin(dto: AuthDTO) {
    // find user by email
    const user = await this.db.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException(`Credentials incorrect`);
    }

    // compare password
    const isEqual = await compare(dto.password, user.hash);
    if (!isEqual) {
      throw new ForbiddenException(`Credentials incorrect`);
    }

    // create and return jwt
    return this.signToken(user.id, user.email);
  }

  /**
   * @returns Method for user registration
   */
  async signup(dto: AuthDTO) {
    try {
      // generate password
      const hashedPwd = await hash(dto.password, 12);

      // save new user in db
      const user = await this.db.user.create({
        data: {
          email: dto.email,
          hash: hashedPwd,
        },
      });

      // temp solution
      delete user.hash;

      // return saved user
      return user;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          // duplication error code
          throw new ForbiddenException(`Credentials taken`);
        }
      }
      throw err;
    }
  }

  async signToken(userId: number, email: string) {
    const token = await this.jwt.signAsync(
      {
        userId,
        email,
      },
      {
        expiresIn: '15m',
        secret: this.config.get('JWT_SECRET'),
      },
    );

    return {
      access_token: token,
    };
  }
}
