import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User types
export interface User {
  _id: string;
  email: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Agent types
export interface AgentAskRequest {
  userId: string;
  conversationId?: string;
  question: string;
}

export interface AgentResponse {
  answer: string;
  conversationId: string;
}

// Conversation types
export interface Message {
  question: string;
  answer: string;
}

export interface Conversation {
  _id: string;
  user: string;
  summary: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// API functions
export const userApi = {
  create: (data: CreateUserRequest): Promise<User> =>
    api.post('/users', data).then(res => res.data),

  login: (data: LoginRequest): Promise<User> =>
    api.post('/users/login', data).then(res => res.data),
};

export const agentApi = {
  ask: (data: AgentAskRequest): Promise<AgentResponse> =>
    api.post('/agent/ask', data).then(res => res.data),

  getWeather: (city: string, userId: string): Promise<AgentResponse> =>
    api.post(`/agent/weather/${city}`, { userId }).then(res => res.data),

  getLocalInfo: (name: string, userId: string): Promise<AgentResponse> =>
    api.post(`/agent/local/${name}`, { userId }).then(res => res.data),

  getConversations: (userId: string): Promise<Conversation[]> =>
    api.get(`/agent/conversations/${userId}`).then(res => res.data),
};

export const conversationApi = {
  create: (userId: string): Promise<{ conversationId: string }> =>
    api.post('/agent/conversations/new', { userId }).then(res => res.data),

  getByUserId: (userId: string): Promise<Conversation[]> =>
    api.get(`/conversations/user/${userId}`).then(res => res.data),
};