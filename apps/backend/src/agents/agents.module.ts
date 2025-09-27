import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentService } from './services/agent.service';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [ConversationsModule],
  controllers: [AgentsController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentsModule {}