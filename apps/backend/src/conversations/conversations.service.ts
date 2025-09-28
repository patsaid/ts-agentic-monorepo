import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { CreateConversationDto } from './dto/conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
  ) {}

  async create(createConversationDto: CreateConversationDto): Promise<{ conversationId: string }> {
    const conversation = new this.conversationModel({
      user: createConversationDto.userId,
      summary: '',
      messages: [],
    });

    await conversation.save();
    return { conversationId: conversation._id.toString() };
  }

  async findByUserId(userId: string): Promise<ConversationDocument[]> {
    return this.conversationModel.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<ConversationDocument | null> {
    return this.conversationModel.findById(id).exec();
  }

  async addMessage(
    conversationId: string,
    question: string,
    answer: string,
  ): Promise<ConversationDocument> {
    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    conversation.messages.push({ question, answer });

    // Update summary if it's empty
    if (!conversation.summary) {
      conversation.summary = question.slice(0, 50) + '...';
    }

    return conversation.save();
  }

  async createOrFindConversation(
    userId: string,
    conversationId?: string,
  ): Promise<ConversationDocument> {
    if (conversationId) {
      const existing = await this.findById(conversationId);
      if (existing) {
        return existing;
      }
    }

    // Create new conversation
    const conversation = new this.conversationModel({
      user: userId,
      summary: '',
      messages: [],
    });

    return conversation.save();
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.conversationModel.deleteMany({ user: userId });
  }
}
