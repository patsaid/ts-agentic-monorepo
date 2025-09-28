import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInfo, UserInfoSchema } from './schemas/user-info.schema';
import { UserInfoService } from './services/user-info.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserInfo.name, schema: UserInfoSchema }]),
  ],
  providers: [UserInfoService],
  exports: [UserInfoService],
})
export class UserInfoModule {}