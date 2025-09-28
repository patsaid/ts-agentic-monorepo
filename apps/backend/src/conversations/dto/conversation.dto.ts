import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    example: '64c9f4f8c2d5f2e4b8d12345',
    description: 'User ID who owns the conversation',
  })
  @IsString()
  userId: string;
}
