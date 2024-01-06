import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateBookmarkDTO, EditBookmarkDTO } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private db: DatabaseService) {}

  getBookmarks(userId: number) {
    return this.db.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  getBookmarkById(userId: number, bookMarkId: number) {
    return this.db.bookmark.findFirst({
      where: {
        userId,
        id: bookMarkId,
      },
    });
  }

  async createBookmark(userId: number, dto: CreateBookmarkDTO) {
    const bookmark = await this.db.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookMarkId: number,
    dto: EditBookmarkDTO,
  ) {
    const bookmark = await this.db.bookmark.findUnique({
      where: {
        id: bookMarkId,
        userId,
      },
    });

    if (!bookmark) {
      throw new ForbiddenException(`Access to resource denied`);
    }

    return this.db.bookmark.update({
      where: {
        id: bookMarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookMarkId: number) {
    const bookmark = await this.db.bookmark.findUnique({
      where: {
        id: bookMarkId,
        userId,
      },
    });

    if (!bookmark) {
      throw new ForbiddenException(`Access to resource denied`);
    }

    await this.db.bookmark.delete({
      where: {
        id: bookMarkId,
      },
    });
  }
}
