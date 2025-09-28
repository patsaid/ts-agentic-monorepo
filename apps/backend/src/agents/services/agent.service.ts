import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Agent, run, tool } from '@openai/agents';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { UserInfoService } from '../../user-info/services/user-info.service';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private agent: Agent;
  private chatModel: ChatOpenAI;

  constructor(
    private configService: ConfigService,
    private userInfoService: UserInfoService,
  ) {
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
        description: 'Get comprehensive information about a user from the local database including personal details, hobbies, life events, and more',
        parameters: z.object({ name: z.string() }),
        execute: async (input) => {
          try {
            const user = await this.userInfoService.findByName(input.name);

            if (user) {
              // Format life events for better readability
              const lifeEventsText = user.lifeEvents.length > 0
                ? user.lifeEvents
                    .map((event) => `${event.date}: ${event.event}${event.description ? ` - ${event.description}` : ''}`)
                    .join('\n  ')
                : 'No life events recorded';

              const hobbiesText = user.hobbies.length > 0 ? user.hobbies.join(', ') : 'No hobbies recorded';

              return `Found user ${user.name}:
📍 Personal Details:
  - Age: ${user.age} years old
  - Current Location: ${user.location}
  - Place of Birth: ${user.placeOfBirth}
  - Occupation: ${user.occupation}
  - Education: ${user.education || 'Not specified'}
  - Marital Status: ${user.maritalStatus || 'Not specified'}

🎯 Hobbies: ${hobbiesText}

📅 Life Events:
  ${lifeEventsText}

📞 Contact:
  - Email: ${user.email || 'Not provided'}
  - Phone: ${user.phoneNumber || 'Not provided'}

💭 Bio: ${user.bio || 'No bio available'}`;
            } else {
              // Get list of available users
              const allUsers = await this.userInfoService.findAll();
              const availableNames = allUsers.map((u) => u.name).join(', ');
              return `No user found with the name "${input.name}" in the local database. Available users: ${availableNames || 'None'}.`;
            }
          } catch (error) {
            this.logger.error('Error in getLocalInfoTool:', error);
            return `Sorry, I encountered an error while looking up information for "${input.name}". Please try again later.`;
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

  async runAgent(
    question: string,
    conversationHistory?: Array<{ question: string; answer: string }>,
  ): Promise<string> {
    try {
      if (!this.agent) {
        return 'Agent not available. Please check your OpenAI API key configuration.';
      }

      // Build context with conversation history
      let contextualQuestion = question;
      if (conversationHistory && conversationHistory.length > 0) {
        const historyContext = conversationHistory
          .map(
            (msg, index) =>
              `Previous conversation ${index + 1}:\nUser: ${msg.question}\nAssistant: ${msg.answer}`,
          )
          .join('\n\n');

        contextualQuestion = `Here is our conversation history for context:

${historyContext}

Current question: ${question}

Please respond to the current question while being aware of our conversation history.`;
      }

      this.logger.log(
        `Processing question with ${conversationHistory?.length || 0} previous messages: "${question}"`,
      );
      const result = await run(this.agent, contextualQuestion);
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
