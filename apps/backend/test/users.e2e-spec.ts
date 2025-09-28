import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { UsersModule } from '../src/users/users.module';
import { User, UserSchema } from '../src/users/schemas/user.schema';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('/users (POST)', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(validUserData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.email).toBe(validUserData.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 409 if user already exists', async () => {
      // First, create a user
      await request(app.getHttpServer()).post('/users').send(validUserData).expect(201);

      // Try to create the same user again
      return request(app.getHttpServer()).post('/users').send(validUserData).expect(409);
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for short password', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test2@example.com',
          password: '123',
        })
        .expect(400);
    });

    it('should return 400 for missing fields', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test3@example.com',
        })
        .expect(400);
    });
  });

  describe('/users/login (POST)', () => {
    const userData = {
      email: 'login@example.com',
      password: 'password123',
    };

    beforeEach(async () => {
      // Create a user for login tests
      await request(app.getHttpServer()).post('/users').send(userData).expect(201);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send(userData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.email).toBe(userData.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 401 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: userData.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/users/:id (PUT)', () => {
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'update@example.com',
          password: 'password123',
        })
        .expect(201);

      userId = response.body._id;
    });

    it('should update user email', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send({
          email: 'updated@example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('updated@example.com');
        });
    });

    it('should update user password', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send({
          password: 'newpassword123',
        })
        .expect(200);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .put('/users/64c9f4f8c2d5f2e4b8d99999')
        .send({
          email: 'test@example.com',
        })
        .expect(404);
    });
  });

  describe('/users/:id (DELETE)', () => {
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'delete@example.com',
          password: 'password123',
        })
        .expect(201);

      userId = response.body._id;
    });

    it('should delete user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('User deleted successfully');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer()).delete('/users/64c9f4f8c2d5f2e4b8d99999').expect(404);
    });
  });
});
