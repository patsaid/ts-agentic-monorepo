import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'alice@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'secret123',
    description: 'User password (minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginUserDto {
  @ApiProperty({
    example: 'alice@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'secret123',
    description: 'User password',
  })
  @IsString()
  password: string;
}

export class UpdateUserDto {
  @ApiProperty({
    example: 'newemail@example.com',
    description: 'New email address',
    required: false,
  })
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'New password',
    required: false,
  })
  @IsString()
  @MinLength(6)
  password?: string;
}