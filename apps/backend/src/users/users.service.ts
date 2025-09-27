import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ _id: string; email: string }> {
    const { email, password } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new this.userModel({
      email,
      hashed_password: hashedPassword,
    });

    await user.save();
    return { _id: user._id.toString(), email: user.email };
  }

  async login(loginUserDto: LoginUserDto): Promise<{ _id: string; email: string }> {
    const { email, password } = loginUserDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { _id: user._id.toString(), email: user.email };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<{ _id: string; email: string }> {
    const updateData: Partial<{ email: string; hashed_password: string }> = {};

    if (updateUserDto.email) {
      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      updateData.hashed_password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = await this.userModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return { _id: updated._id.toString(), email: updated.email };
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.userModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new NotFoundException('User not found');
    }

    // Note: Conversation cascade deletion will be handled by the conversation service
    return { message: 'User deleted successfully' };
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }
}