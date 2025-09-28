import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';

import { ConversationsService } from './conversations.service';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { CreateConversationDto } from './dto/conversation.dto';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let conversationModel: Model<ConversationDocument>;

  const mockConversation = {
    _id: '64ca0f1a3b4e2c5d6f7a1234',
    user: '64c9f4f8c2d5f2e4b8d12345',
    summary: 'Test conversation',
    messages: [{ question: 'Hello', answer: 'Hi there!' }],
    save: jest.fn(),
  };

  const mockConversationModel: any = jest.fn().mockImplementation(() => mockConversation);
  mockConversationModel.find = jest.fn();
  mockConversationModel.findById = jest.fn();
  mockConversationModel.sort = jest.fn();
  mockConversationModel.exec = jest.fn();
  mockConversationModel.deleteMany = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: getModelToken(Conversation.name),
          useValue: mockConversationModel,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    conversationModel = module.get<Model<ConversationDocument>>(getModelToken(Conversation.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createConversationDto: CreateConversationDto = {
      userId: '64c9f4f8c2d5f2e4b8d12345',
    };

    it('should create a new conversation successfully', async () => {
      mockConversation.save.mockResolvedValue(mockConversation);

      const result = await service.create(createConversationDto);

      expect(result).toEqual({
        conversationId: mockConversation._id,
      });
      expect(mockConversation.save).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should return conversations for a user', async () => {
      const mockSort = { exec: jest.fn().mockResolvedValue([mockConversation]) };
      mockConversationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue(mockSort),
      });

      const result = await service.findByUserId('64c9f4f8c2d5f2e4b8d12345');

      expect(result).toEqual([mockConversation]);
      expect(mockConversationModel.find).toHaveBeenCalledWith({
        user: '64c9f4f8c2d5f2e4b8d12345',
      });
    });
  });

  describe('findById', () => {
    it('should return conversation by id', async () => {
      mockConversationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConversation),
      });

      const result = await service.findById('64ca0f1a3b4e2c5d6f7a1234');

      expect(result).toEqual(mockConversation);
      expect(mockConversationModel.findById).toHaveBeenCalledWith('64ca0f1a3b4e2c5d6f7a1234');
    });

    it('should return null if conversation not found', async () => {
      mockConversationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('addMessage', () => {
    it('should add message to existing conversation', async () => {
      const conversationWithMessages = {
        ...mockConversation,
        messages: [],
        save: jest.fn().mockResolvedValue({
          ...mockConversation,
          messages: [{ question: 'New question', answer: 'New answer' }],
        }),
      };

      mockConversationModel.findById.mockResolvedValue(conversationWithMessages);

      const result = await service.addMessage(
        '64ca0f1a3b4e2c5d6f7a1234',
        'New question',
        'New answer',
      );

      expect(conversationWithMessages.messages).toContainEqual({
        question: 'New question',
        answer: 'New answer',
      });
      expect(conversationWithMessages.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if conversation not found', async () => {
      mockConversationModel.findById.mockResolvedValue(null);

      await expect(service.addMessage('nonexistent', 'question', 'answer')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update summary if empty', async () => {
      const conversationWithoutSummary = {
        ...mockConversation,
        summary: '',
        messages: [],
        save: jest.fn().mockResolvedValue(mockConversation),
      };

      mockConversationModel.findById.mockResolvedValue(conversationWithoutSummary);

      await service.addMessage(
        '64ca0f1a3b4e2c5d6f7a1234',
        'This is a very long question that should be truncated',
        'Answer',
      );

      expect(conversationWithoutSummary.summary).toBe(
        'This is a very long question that should be trunca...',
      );
    });
  });

  describe('createOrFindConversation', () => {
    it('should return existing conversation if found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockConversation as any);

      const result = await service.createOrFindConversation(
        '64c9f4f8c2d5f2e4b8d12345',
        '64ca0f1a3b4e2c5d6f7a1234',
      );

      expect(result).toEqual(mockConversation);
      expect(service.findById).toHaveBeenCalledWith('64ca0f1a3b4e2c5d6f7a1234');
    });

    it('should create new conversation if not found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      mockConversation.save.mockResolvedValue(mockConversation);

      const result = await service.createOrFindConversation(
        '64c9f4f8c2d5f2e4b8d12345',
        'nonexistent',
      );

      expect(mockConversation.save).toHaveBeenCalled();
    });

    it('should create new conversation if no id provided', async () => {
      mockConversation.save.mockResolvedValue(mockConversation);

      const result = await service.createOrFindConversation('64c9f4f8c2d5f2e4b8d12345');

      expect(mockConversation.save).toHaveBeenCalled();
    });
  });

  describe('deleteByUserId', () => {
    it('should delete all conversations for a user', async () => {
      mockConversationModel.deleteMany.mockResolvedValue({ deletedCount: 3 });

      await service.deleteByUserId('64c9f4f8c2d5f2e4b8d12345');

      expect(mockConversationModel.deleteMany).toHaveBeenCalledWith({
        user: '64c9f4f8c2d5f2e4b8d12345',
      });
    });
  });
});
