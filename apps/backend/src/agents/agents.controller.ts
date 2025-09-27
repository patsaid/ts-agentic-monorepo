import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AgentService } from './services/agent.service';
import { ConversationsService } from '../conversations/conversations.service';
import { AgentAskDto, WeatherRequestDto, LocalInfoRequestDto } from './dto/agent.dto';

@ApiTags('Agent')
@Controller('agent')
export class AgentsController {
  constructor(
    private readonly agentService: AgentService,
    private readonly conversationsService: ConversationsService,
  ) {}

  @Post('conversations/new')
  @ApiOperation({ summary: 'Start a new conversation for a user' })
  @ApiResponse({
    status: 201,
    description: 'New conversation created',
    schema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', example: '64ca0f1a3b4e2c5d6f7a1234' },
      },
    },
  })
  async createConversation(@Body() body: { userId: string }) {
    return this.conversationsService.create(body);
  }

  @Post('ask')
  @ApiOperation({ summary: 'Ask the agent a question (link to a conversation)' })
  @ApiResponse({
    status: 200,
    description: 'Answer from the agent with conversation info',
    schema: {
      type: 'object',
      properties: {
        answer: { type: 'string' },
        conversationId: { type: 'string' },
      },
    },
  })
  async askAgent(@Body() agentAskDto: AgentAskDto) {
    const { question, userId, conversationId } = agentAskDto;

    // Run the agent
    const answer = await this.agentService.runAgent(question);

    // Find or create conversation
    const conversation = await this.conversationsService.createOrFindConversation(userId, conversationId);

    // Add message to conversation
    await this.conversationsService.addMessage(conversation._id.toString(), question, answer);

    return {
      answer,
      conversationId: conversation._id.toString(),
    };
  }

  @Get('conversations/:userId')
  @ApiOperation({ summary: 'Get all conversations for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'List of conversations',
  })
  async getConversations(@Param('userId') userId: string) {
    return this.conversationsService.findByUserId(userId);
  }

  @Post('weather/:city')
  @ApiOperation({ summary: 'Get weather info for a city (with persistence)' })
  @ApiParam({ name: 'city', description: 'City name' })
  @ApiResponse({
    status: 200,
    description: 'Weather answer with persisted conversation',
    schema: {
      type: 'object',
      properties: {
        answer: { type: 'string' },
        conversationId: { type: 'string' },
      },
    },
  })
  async getWeather(@Param('city') city: string, @Body() weatherRequestDto: WeatherRequestDto) {
    const { userId } = weatherRequestDto;
    const question = `What is the weather in ${city}?`;

    const answer = await this.agentService.runAgent(question);

    // Find or create conversation
    const conversation = await this.conversationsService.createOrFindConversation(userId);

    // Add message to conversation
    await this.conversationsService.addMessage(conversation._id.toString(), question, answer);

    return {
      answer,
      conversationId: conversation._id.toString(),
    };
  }

  @Post('local/:name')
  @ApiOperation({ summary: 'Fetch local DB info via the agent (with persistence)' })
  @ApiParam({ name: 'name', description: 'Name to fetch info for' })
  @ApiResponse({
    status: 200,
    description: 'Answer from the agent with persisted conversation',
    schema: {
      type: 'object',
      properties: {
        answer: { type: 'string' },
        conversationId: { type: 'string' },
      },
    },
  })
  async getLocalInfo(@Param('name') name: string, @Body() localInfoRequestDto: LocalInfoRequestDto) {
    const { userId } = localInfoRequestDto;
    const question = `Fetch info for user ${name}`;

    const answer = await this.agentService.runAgent(question);

    // Find or create conversation
    const conversation = await this.conversationsService.createOrFindConversation(userId);

    // Add message to conversation
    await this.conversationsService.addMessage(conversation._id.toString(), question, answer);

    return {
      answer,
      conversationId: conversation._id.toString(),
    };
  }
}