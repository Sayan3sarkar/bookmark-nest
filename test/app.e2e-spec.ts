import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { AppModule } from 'src/app.module';
import { AuthDTO } from 'src/auth/dto';
import { CreateBookmarkDTO, EditBookmarkDTO } from 'src/bookmark/dto';
import { DatabaseService } from 'src/database/database.service';
import { EditUserDTO } from 'src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let db: DatabaseService;
  pactum.request.setBaseUrl('http://localhost:3000');

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3000);

    db = app.get(DatabaseService);

    await db.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDTO = {
      email: 'test1@test.com',
      password: 'test123',
    };
    describe('Sign Up', () => {
      it('should throw error if mail empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, email: null })
          .expectStatus(400);
      });

      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, password: null })
          .expectStatus(400);
      });

      it('should throw error if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Sign In', () => {
      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });

      it('should throw error if mail empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, email: null })
          .expectStatus(400);
      });

      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, password: null })
          .expectStatus(400);
      });

      it('should throw error if incorrect password', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, password: 'test' })
          .expectStatus(403);
      });

      it('should throw error if incorrect email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, email: 'abcd@efgh.com' })
          .expectStatus(403);
      });
    });
  });

  describe('User', () => {
    describe('Get Current User', () => {
      it('Should get current user', () => {
        return pactum
          .spec()
          .get('/users/curr')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(200);
      });
    });
    describe('Edit User', () => {
      it('Should edit user', () => {
        const dto: EditUserDTO = { firstName: 'Sayan' };
        return pactum
          .spec()
          .patch('/users')
          .withBearerToken('$S{userAccessToken}')
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get Empty Bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create Bookmark', () => {
      it('should create bookmarks', () => {
        const dto: CreateBookmarkDTO = {
          title: 'bookmark1',
          link: 'http://bookmark1.com',
        };
        return pactum
          .spec()
          .post('/bookmarks')
          .withBearerToken('$S{userAccessToken}')
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get Bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(200);
      });
    });
    describe('Get Bookmark By Id', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('Edit Bookmark by id', () => {
      it('should edit bookmark by id', () => {
        const dto: EditBookmarkDTO = {
          description: 'Bookmark description test',
        };
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAccessToken}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.description);
      });

      it('should not edit bookmark for wrong id', () => {
        const dto: EditBookmarkDTO = {
          description: 'Bookmark description test',
        };
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '888')
          .withBearerToken('$S{userAccessToken}')
          .withBody(dto)
          .expectStatus(403);
      });
    });
    describe('Delete Bookmark by id', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(204)
          .inspect();
      });

      it('Should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
