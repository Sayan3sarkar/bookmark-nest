import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { EditUserDTO } from './dto';

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}
  async editUser(userId: number, dto: EditUserDTO) {
    const user = await this.db.user.update({
      where: { id: userId },
      data: { ...dto },
    });

    delete user.hash;
    return user;
  }
}
