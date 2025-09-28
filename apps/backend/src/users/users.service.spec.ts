import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<UserDocument>;

  const mockUser = {
    _id: '64c9f4f8c2d5f2e4b8d12345',
    email: 'test@example.com',
    hashed_password: 'hashedPassword123',
    save: jest.fn(),
  };

  const mockUserModel: any = jest.fn().mockImplementation(() => mockUser);
  mockUserModel.findOne = jest.fn();
  mockUserModel.findById = jest.fn();
  mockUserModel.findByIdAndUpdate = jest.fn();
  mockUserModel.findByIdAndDelete = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));

    // Clear all mocks to avoid "Cannot redefine property" errors
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should create a new user successfully', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUser.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        _id: mockUser._id,
        email: mockUser.email,
      });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: createUserDto.email });
    });
  });

  describe('login', () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.login(loginUserDto);

      expect(result).toEqual({
        _id: mockUser._id,
        email: mockUser.email,
      });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: loginUserDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginUserDto.password, mockUser.hashed_password);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      email: 'newemail@example.com',
      password: 'newpassword123',
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, email: updateUserDto.email };
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await service.update('64c9f4f8c2d5f2e4b8d12345', updateUserDto);

      expect(result).toEqual({
        _id: updatedUser._id,
        email: updatedUser.email,
      });
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '64c9f4f8c2d5f2e4b8d12345',
        {
          email: updateUserDto.email,
          hashed_password: 'hashedPassword123',
        },
        { new: true },
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update('64c9f4f8c2d5f2e4b8d12345', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await service.remove('64c9f4f8c2d5f2e4b8d12345');

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('64c9f4f8c2d5f2e4b8d12345');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.remove('64c9f4f8c2d5f2e4b8d12345')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.findById('64c9f4f8c2d5f2e4b8d12345');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('64c9f4f8c2d5f2e4b8d12345');
    });

    it('should return null if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await service.findById('64c9f4f8c2d5f2e4b8d12345');

      expect(result).toBeNull();
    });
  });
});
