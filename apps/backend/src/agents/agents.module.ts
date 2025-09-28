import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentService } from './services/agent.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { UserInfoModule } from '../user-info/user-info.module';

@Module({
  imports: [ConversationsModule, UserInfoModule],
  controllers: [AgentsController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentsModule {}
