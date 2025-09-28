import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LifeEvent = {
  event: string;
  date: string;
  description?: string;
};

@Schema({ timestamps: true })
export class UserInfo extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  occupation: string;

  @Prop({ required: true })
  placeOfBirth: string;

  @Prop({ type: [String], default: [] })
  hobbies: string[];

  @Prop({
    type: [
      {
        event: { type: String, required: true },
        date: { type: String, required: true },
        description: { type: String },
      },
    ],
    default: [],
  })
  lifeEvents: LifeEvent[];

  @Prop()
  email?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  education?: string;

  @Prop()
  maritalStatus?: string;

  @Prop()
  bio?: string;
}

export const UserInfoSchema = SchemaFactory.createForClass(UserInfo);