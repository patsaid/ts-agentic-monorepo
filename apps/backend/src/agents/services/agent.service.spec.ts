import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AgentService } from './agent.service';
import { UserInfoService } from '../../user-info/services/user-info.service';

// Mock the external dependencies
jest.mock('@openai/agents', () => ({
  Agent: jest.fn().mockImplementation(() => ({
    name: 'Test Agent',
  })),
  run: jest.fn(),
  tool: jest.fn().mockImplementation((config) => config),
}));

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
  })),
}));

describe('AgentService', () => {
  let service: AgentService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserInfoService = {
    getUserInfo: jest.fn(),
    createUserInfo: jest.fn(),
    updateUserInfo: jest.fn(),
    deleteUserInfo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UserInfoService,
          useValue: mockUserInfoService,
        },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize agent service', () => {
      // Test that the service initializes without errors
      expect(service).toBeInstanceOf(AgentService);
    });
  });

  describe('runAgent', () => {
    it('should return agent response when agent is available', async () => {
      // Mock the agent and run function
      const mockAgent = { name: 'Test Agent' };
      const mockResult = { finalOutput: 'Test response' };

      service['agent'] = mockAgent as any;

      const { run } = require('@openai/agents');
      run.mockResolvedValue(mockResult);

      const result = await service.runAgent('test question');

      expect(result).toBe('Test response');
      expect(run).toHaveBeenCalledWith(mockAgent, 'test question');
    });

    it('should return error message when agent is not available', async () => {
      service['agent'] = null;

      const result = await service.runAgent('test question');

      expect(result).toBe('Agent not available. Please check your OpenAI API key configuration.');
    });

    it('should handle errors gracefully', async () => {
      const mockAgent = { name: 'Test Agent' };
      service['agent'] = mockAgent as any;

      const { run } = require('@openai/agents');
      run.mockRejectedValue(new Error('API Error'));

      const result = await service.runAgent('test question');

      expect(result).toContain(
        'I apologize, but I encountered an error processing your request: API Error',
      );
    });
  });

  describe('simpleChat', () => {
    it('should return chat response when chat model is available', async () => {
      const mockChatModel = {
        invoke: jest.fn().mockResolvedValue({ content: 'Chat response' }),
      };
      service['chatModel'] = mockChatModel as any;

      const result = await service.simpleChat('test message');

      expect(result).toBe('Chat response');
      expect(mockChatModel.invoke).toHaveBeenCalledWith('test message');
    });

    it('should return error message when chat model is not available', async () => {
      service['chatModel'] = null;

      const result = await service.simpleChat('test message');

      expect(result).toBe(
        'Chat model not available. Please check your OpenAI API key configuration.',
      );
    });

    it('should handle errors gracefully', async () => {
      const mockChatModel = {
        invoke: jest.fn().mockRejectedValue(new Error('Chat API Error')),
      };
      service['chatModel'] = mockChatModel as any;

      const result = await service.simpleChat('test message');

      expect(result).toContain('I apologize, but I encountered an error: Chat API Error');
    });
  });
});
