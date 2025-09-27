import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AgentAskDto {
  @ApiProperty({
    example: '64c9f4f8c2d5f2e4b8d12345',
    description: 'User ID asking the question',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: '64ca0f1a3b4e2c5d6f7a1234',
    description: 'Optional conversation ID. If not provided, a new conversation will be created.',
    required: false,
  })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiProperty({
    example: 'Who is the president of France?',
    description: 'The question to ask the agent',
  })
  @IsString()
  question: string;
}

export class WeatherRequestDto {
  @ApiProperty({
    example: '64c9f4f8c2d5f2e4b8d12345',
    description: 'User ID making the request',
  })
  @IsString()
  userId: string;
}

export class LocalInfoRequestDto {
  @ApiProperty({
    example: '64c9f4f8c2d5f2e4b8d12345',
    description: 'User ID making the request',
  })
  @IsString()
  userId: string;
}