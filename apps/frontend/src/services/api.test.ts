import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios with factory function
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      ...mockAxiosInstance,
    },
  };
});

// Import API services after mocking
import { userApi, agentApi, conversationApi } from './api';
import axios from 'axios';

const mockedAxios = vi.mocked(axios);
const mockAxiosInstance = mockedAxios.create() as any;

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('userApi', () => {
    describe('create', () => {
      it('should create a new user', async () => {
        const userData = { email: 'test@example.com', password: 'password123' };
        const responseData = { _id: '12345', email: 'test@example.com' };

        mockAxiosInstance.post.mockResolvedValue({ data: responseData });

        const result = await userApi.create(userData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', userData);
        expect(result).toEqual(responseData);
      });

      it('should handle create user error', async () => {
        const userData = { email: 'test@example.com', password: 'password123' };
        const error = new Error('User already exists');

        mockAxiosInstance.post.mockRejectedValue(error);

        await expect(userApi.create(userData)).rejects.toThrow('User already exists');
      });
    });

    describe('login', () => {
      it('should login user successfully', async () => {
        const loginData = { email: 'test@example.com', password: 'password123' };
        const responseData = { _id: '12345', email: 'test@example.com' };

        mockAxiosInstance.post.mockResolvedValue({ data: responseData });

        const result = await userApi.login(loginData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/login', loginData);
        expect(result).toEqual(responseData);
      });

      it('should handle login error', async () => {
        const loginData = { email: 'test@example.com', password: 'wrongpassword' };
        const error = new Error('Invalid credentials');

        mockAxiosInstance.post.mockRejectedValue(error);

        await expect(userApi.login(loginData)).rejects.toThrow('Invalid credentials');
      });
    });
  });

  describe('agentApi', () => {
    describe('ask', () => {
      it('should send question to agent', async () => {
        const requestData = {
          userId: '12345',
          conversationId: 'conv123',
          question: 'Hello, how are you?',
        };
        const responseData = {
          answer: 'I am doing well, thank you!',
          conversationId: 'conv123',
        };

        mockAxiosInstance.post.mockResolvedValue({ data: responseData });

        const result = await agentApi.ask(requestData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/agent/ask', requestData);
        expect(result).toEqual(responseData);
      });

      it('should handle ask error', async () => {
        const requestData = {
          userId: '12345',
          question: 'Hello',
        };
        const error = new Error('Agent unavailable');

        mockAxiosInstance.post.mockRejectedValue(error);

        await expect(agentApi.ask(requestData)).rejects.toThrow('Agent unavailable');
      });
    });

    describe('getWeather', () => {
      it('should get weather for city', async () => {
        const city = 'Paris';
        const userId = '12345';
        const responseData = {
          answer: 'The weather in Paris is sunny and 25°C',
          conversationId: 'weather-conv',
        };

        mockAxiosInstance.post.mockResolvedValue({ data: responseData });

        const result = await agentApi.getWeather(city, userId);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/agent/weather/${city}`, { userId });
        expect(result).toEqual(responseData);
      });
    });

    describe('getLocalInfo', () => {
      it('should get local user information', async () => {
        const name = 'Alice';
        const userId = '12345';
        const responseData = {
          answer: 'Found user Alice: 30 years old, located in New York',
          conversationId: 'info-conv',
        };

        mockAxiosInstance.post.mockResolvedValue({ data: responseData });

        const result = await agentApi.getLocalInfo(name, userId);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/agent/local/${name}`, { userId });
        expect(result).toEqual(responseData);
      });
    });

    describe('getConversations', () => {
      it('should get user conversations', async () => {
        const userId = '12345';
        const responseData = [
          {
            _id: 'conv1',
            user: userId,
            summary: 'Test conversation',
            messages: [],
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: responseData });

        const result = await agentApi.getConversations(userId);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/agent/conversations/${userId}`);
        expect(result).toEqual(responseData);
      });
    });
  });

  describe('conversationApi', () => {
    describe('create', () => {
      it('should create new conversation', async () => {
        const userId = '12345';
        const responseData = { conversationId: 'new-conv-id' };

        mockAxiosInstance.post.mockResolvedValue({ data: responseData });

        const result = await conversationApi.create(userId);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/agent/conversations/new', { userId });
        expect(result).toEqual(responseData);
      });
    });

    describe('getByUserId', () => {
      it('should get conversations by user id', async () => {
        const userId = '12345';
        const responseData = [
          {
            _id: 'conv1',
            user: userId,
            summary: 'Test conversation',
            messages: [],
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        ];

        mockAxiosInstance.get.mockResolvedValue({ data: responseData });

        const result = await conversationApi.getByUserId(userId);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/conversations/user/${userId}`);
        expect(result).toEqual(responseData);
      });
    });
  });

  describe('API configuration', () => {
    it('should have axios instance created', () => {
      // The api instance should be created and available
      expect(mockAxiosInstance).toBeDefined();
      expect(mockAxiosInstance.get).toBeDefined();
      expect(mockAxiosInstance.post).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';

      mockAxiosInstance.post.mockRejectedValue(networkError);

      await expect(
        userApi.create({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Network Error');
    });

    it('should handle HTTP errors', async () => {
      const httpError = {
        response: {
          status: 400,
          data: { error: 'Bad Request' },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(httpError);

      await expect(
        userApi.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toEqual(httpError);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');
      timeoutError.name = 'TimeoutError';

      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(agentApi.getConversations('12345')).rejects.toThrow(
        'timeout of 5000ms exceeded',
      );
    });
  });
});
