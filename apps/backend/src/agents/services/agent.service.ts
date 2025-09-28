import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Agent, run, tool } from '@openai/agents';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private agent: Agent;
  private chatModel: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');

      if (!openaiApiKey) {
        this.logger.warn('OPENAI_API_KEY not found. Agent functionality will be limited.');
        return;
      }

      // Initialize ChatOpenAI model
      this.chatModel = new ChatOpenAI({
        apiKey: openaiApiKey,
        modelName: 'gpt-4o-mini',
        temperature: 0.7,
      });

      // Create weather tool
      const getWeatherTool = tool({
        name: 'get_weather',
        description: 'Get the weather for a given city',
        parameters: z.object({ city: z.string() }),
        execute: async (input) => {
          // Simulate weather API call
          const weatherConditions = ['sunny', 'cloudy', 'rainy', 'partly cloudy', 'snowy'];
          const temperatures = [15, 18, 22, 25, 28, 30];
          const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
          const temp = temperatures[Math.floor(Math.random() * temperatures.length)];

          return `The weather in ${input.city} is ${condition} with a temperature of ${temp}°C. This is a simulated weather response - in production, you would integrate with a real weather API.`;
        },
      });

      // Create local database tool
      const getLocalInfoTool = tool({
        name: 'get_local_info',
        description: 'Get information about a user from the local database',
        parameters: z.object({ name: z.string() }),
        execute: async (input) => {
          // Simulate database lookup
          const users = [
            { name: 'Alice', age: 30, location: 'New York', occupation: 'Engineer' },
            { name: 'Bob', age: 25, location: 'San Francisco', occupation: 'Designer' },
            { name: 'Charlie', age: 35, location: 'London', occupation: 'Product Manager' },
          ];

          const user = users.find(u => u.name.toLowerCase() === input.name.toLowerCase());

          if (user) {
            return `Found user ${user.name}: ${user.age} years old, located in ${user.location}, works as a ${user.occupation}.`;
          } else {
            return `No user found with the name "${input.name}" in the local database. Available users: ${users.map(u => u.name).join(', ')}.`;
          }
        },
      });

      // Create the agent with multiple tools
      this.agent = new Agent({
        name: 'Assistant Agent',
        instructions: `You are a helpful AI assistant that can answer questions and use various tools.

        You have access to:
        1. A weather tool to get weather information for any city
        2. A local database tool to lookup user information

        Always be friendly, helpful, and provide detailed responses. When using tools, explain what you're doing and provide context about the results.`,
        tools: [getWeatherTool, getLocalInfoTool],
        handoffs: [],
      });

      this.logger.log('🤖 Agent service initialized successfully with OpenAI integration');
    } catch (error) {
      this.logger.error('Failed to initialize agent:', error);
    }
  }

  async runAgent(question: string): Promise<string> {
    try {
      if (!this.agent) {
        return 'Agent not available. Please check your OpenAI API key configuration.';
      }

      this.logger.log(`Processing question: "${question}"`);
      const result = await run(this.agent, question);
      this.logger.log(`Agent response generated successfully`);

      return result.finalOutput;
    } catch (error) {
      this.logger.error('Error running agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return `I apologize, but I encountered an error processing your request: ${errorMessage}. Please try again.`;
    }
  }

  async simpleChat(message: string): Promise<string> {
    try {
      if (!this.chatModel) {
        return 'Chat model not available. Please check your OpenAI API key configuration.';
      }

      this.logger.log(`Processing chat message: "${message}"`);
      const response = await this.chatModel.invoke(message);
      this.logger.log(`Chat response generated successfully`);

      return response.content as string;
    } catch (error) {
      this.logger.error('Error in simple chat:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return `I apologize, but I encountered an error: ${errorMessage}. Please try again.`;
    }
  }
}