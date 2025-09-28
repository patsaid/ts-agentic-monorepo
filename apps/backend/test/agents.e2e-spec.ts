import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { AgentsModule } from '../src/agents/agents.module';
import { ConversationsModule } from '../src/conversations/conversations.module';
import { UsersModule } from '../src/users/users.module';
import { User, UserSchema } from '../src/users/schemas/user.schema';
import { Conversation, ConversationSchema } from '../src/conversations/schemas/conversation.schema';

// Mock the agent service to avoid OpenAI API calls in tests
jest.mock('../src/agents/services/agent.service', () => ({
  AgentService: jest.fn().mockImplementation(() => ({
    runAgent: jest.fn().mockResolvedValue('Mock agent response'),
    simpleChat: jest.fn().mockResolvedValue('Mock chat response'),
  })),
}));

describe('Agents (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let userId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: Conversation.name, schema: ConversationSchema },
        ]),
        UsersModule,
        ConversationsModule,
        AgentsModule,
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

    // Create a test user for agent tests
    const userResponse = await request(app.getHttpServer()).post('/users').send({
      email: 'agent-test@example.com',
      password: 'password123',
    });
    userId = userResponse.body._id;
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('/agent/conversations/new (POST)', () => {
    it('should create a new conversation', () => {
      return request(app.getHttpServer())
        .post('/agent/conversations/new')
        .send({ userId })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('conversationId');
        });
    });

    it('should return 400 for missing userId', () => {
      return request(app.getHttpServer()).post('/agent/conversations/new').send({}).expect(400);
    });
  });

  describe('/agent/ask (POST)', () => {
    const validRequest = {
      userId,
      question: 'Hello, how are you?',
    };

    it('should process agent question and return response', () => {
      return request(app.getHttpServer())
        .post('/agent/ask')
        .send(validRequest)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('answer');
          expect(res.body).toHaveProperty('conversationId');
          expect(res.body.answer).toBe('Mock agent response');
        });
    });

    it('should use existing conversation if provided', async () => {
      // First create a conversation
      const convResponse = await request(app.getHttpServer())
        .post('/agent/conversations/new')
        .send({ userId })
        .expect(201);

      const conversationId = convResponse.body.conversationId;

      return request(app.getHttpServer())
        .post('/agent/ask')
        .send({
          ...validRequest,
          conversationId,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.conversationId).toBe(conversationId);
        });
    });

    it('should return 400 for missing question', () => {
      return request(app.getHttpServer())
        .post('/agent/ask')
        .send({
          userId,
        })
        .expect(400);
    });

    it('should return 400 for missing userId', () => {
      return request(app.getHttpServer())
        .post('/agent/ask')
        .send({
          question: 'Hello',
        })
        .expect(400);
    });
  });

  describe('/agent/conversations/:userId (GET)', () => {
    beforeEach(async () => {
      // Create some conversations for the user
      await request(app.getHttpServer())
        .post('/agent/ask')
        .send({
          userId,
          question: 'First question',
        })
        .expect(200);

      await request(app.getHttpServer())
        .post('/agent/ask')
        .send({
          userId,
          question: 'Second question',
        })
        .expect(200);
    });

    it('should return conversations for the user', () => {
      return request(app.getHttpServer())
        .get(`/agent/conversations/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('_id');
          expect(res.body[0]).toHaveProperty('messages');
        });
    });
  });

  describe('/agent/weather/:city (POST)', () => {
    it('should return weather information', () => {
      return request(app.getHttpServer())
        .post('/agent/weather/Paris')
        .send({ userId })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('answer');
          expect(res.body).toHaveProperty('conversationId');
          expect(res.body.answer).toBe('Mock agent response');
        });
    });

    it('should return 400 for missing userId', () => {
      return request(app.getHttpServer()).post('/agent/weather/Paris').send({}).expect(400);
    });
  });

  describe('/agent/local/:name (POST)', () => {
    it('should return local user information', () => {
      return request(app.getHttpServer())
        .post('/agent/local/Alice')
        .send({ userId })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('answer');
          expect(res.body).toHaveProperty('conversationId');
          expect(res.body.answer).toBe('Mock agent response');
        });
    });

    it('should return 400 for missing userId', () => {
      return request(app.getHttpServer()).post('/agent/local/Alice').send({}).expect(400);
    });
  });
});
