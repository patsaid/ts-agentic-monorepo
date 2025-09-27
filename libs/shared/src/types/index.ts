// User types
export interface User {
  id: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Conversation types
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface CreateConversationDto {
  title: string;
  userId: string;
}

// Agent types
export interface Agent {
  id: string;
  name: string;
  description: string;
  tools: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAgentDto {
  name: string;
  description: string;
  tools: string[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// Agent execution types
export interface AgentExecutionRequest {
  agentId: string;
  conversationId: string;
  message: string;
}

export interface AgentExecutionResponse {
  response: string;
  toolsUsed: string[];
  executionTime: number;
}