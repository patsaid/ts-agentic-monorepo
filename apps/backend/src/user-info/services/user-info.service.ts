import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInfo } from '../schemas/user-info.schema';

@Injectable()
export class UserInfoService {
  private readonly logger = new Logger(UserInfoService.name);

  constructor(
    @InjectModel(UserInfo.name) private userInfoModel: Model<UserInfo>,
  ) {}

  async findByName(name: string): Promise<UserInfo | null> {
    try {
      const user = await this.userInfoModel
        .findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
        .exec();
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by name ${name}:`, error);
      return null;
    }
  }

  async findAll(): Promise<UserInfo[]> {
    try {
      return await this.userInfoModel.find().exec();
    } catch (error) {
      this.logger.error('Error finding all users:', error);
      return [];
    }
  }

  async create(userInfo: Partial<UserInfo>): Promise<UserInfo> {
    try {
      const createdUser = new this.userInfoModel(userInfo);
      return await createdUser.save();
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  async deleteAll(): Promise<void> {
    try {
      await this.userInfoModel.deleteMany({}).exec();
      this.logger.log('All user info records deleted');
    } catch (error) {
      this.logger.error('Error deleting all users:', error);
      throw error;
    }
  }

  async seedUsers(): Promise<void> {
    try {
      // Check if users already exist
      const existingUsers = await this.userInfoModel.countDocuments();
      if (existingUsers > 0) {
        this.logger.log('User info already seeded, skipping...');
        return;
      }

      const sampleUsers = [
        {
          name: 'Alice',
          age: 30,
          location: 'New York',
          occupation: 'Software Engineer',
          placeOfBirth: 'Boston, MA',
          hobbies: ['Reading', 'Rock Climbing', 'Photography', 'Cooking'],
          lifeEvents: [
            {
              event: 'Graduated College',
              date: '2015-05-15',
              description: 'MIT Computer Science degree',
            },
            {
              event: 'First Job',
              date: '2015-08-01',
              description: 'Started as Junior Developer at TechCorp',
            },
            {
              event: 'Marriage',
              date: '2020-09-12',
              description: 'Married to John Smith in Central Park',
            },
            {
              event: 'Promotion',
              date: '2021-03-01',
              description: 'Promoted to Senior Software Engineer',
            },
          ],
          email: 'alice.smith@email.com',
          phoneNumber: '+1-555-0123',
          education: 'MIT - Computer Science (BS)',
          maritalStatus: 'Married',
          bio: 'Passionate software engineer who loves solving complex problems and mentoring junior developers.',
        },
        {
          name: 'Bob',
          age: 25,
          location: 'San Francisco',
          occupation: 'UX Designer',
          placeOfBirth: 'Portland, OR',
          hobbies: ['Skateboarding', 'Digital Art', 'Gaming', 'Coffee Roasting'],
          lifeEvents: [
            {
              event: 'Graduated College',
              date: '2020-06-15',
              description: 'Art Institute - Design degree',
            },
            {
              event: 'First Job',
              date: '2020-09-01',
              description: 'Junior UX Designer at StartupXYZ',
            },
            {
              event: 'Published App',
              date: '2022-01-15',
              description: 'Co-created a meditation app that reached 10k downloads',
            },
            {
              event: 'Moved to SF',
              date: '2021-03-01',
              description: 'Relocated for better career opportunities',
            },
          ],
          email: 'bob.johnson@email.com',
          phoneNumber: '+1-555-0456',
          education: 'Art Institute of Portland - Digital Design (BFA)',
          maritalStatus: 'Single',
          bio: 'Creative UX designer focused on making technology more accessible and enjoyable for everyone.',
        },
        {
          name: 'Charlie',
          age: 35,
          location: 'London',
          occupation: 'Product Manager',
          placeOfBirth: 'Manchester, UK',
          hobbies: ['Football', 'Travel', 'Wine Tasting', 'Running'],
          lifeEvents: [
            {
              event: 'Graduated University',
              date: '2010-07-01',
              description: 'Oxford University - Business Administration',
            },
            {
              event: 'Started Career',
              date: '2010-09-01',
              description: 'Management Trainee at Consulting Firm',
            },
            {
              event: 'Marriage',
              date: '2017-06-20',
              description: 'Married to Emma Wilson in countryside wedding',
            },
            {
              event: 'Child Birth',
              date: '2019-03-15',
              description: 'Welcome baby Oliver to the family',
            },
            {
              event: 'Child Birth',
              date: '2021-11-08',
              description: 'Welcome baby Sophie to the family',
            },
            {
              event: 'Moved to London',
              date: '2018-01-01',
              description: 'Relocated for senior product manager role',
            },
          ],
          email: 'charlie.wilson@email.com',
          phoneNumber: '+44-20-7946-0958',
          education: 'Oxford University - Business Administration (MBA)',
          maritalStatus: 'Married',
          bio: 'Experienced product manager who thrives on building products that make a real difference in peoples lives.',
        },
        {
          name: 'Diana',
          age: 28,
          location: 'Austin',
          occupation: 'Data Scientist',
          placeOfBirth: 'Chicago, IL',
          hobbies: ['Yoga', 'Machine Learning', 'Hiking', 'Board Games'],
          lifeEvents: [
            {
              event: 'Graduated College',
              date: '2018-05-20',
              description: 'University of Chicago - Statistics and Mathematics',
            },
            {
              event: 'Masters Degree',
              date: '2020-12-15',
              description: 'Stanford University - Data Science (MS)',
            },
            {
              event: 'First Job',
              date: '2021-01-15',
              description: 'Data Scientist at TechGiant Corp',
            },
            {
              event: 'Published Research',
              date: '2022-08-01',
              description: 'Co-authored paper on ML algorithms in Nature journal',
            },
            {
              event: 'Moved to Austin',
              date: '2023-02-01',
              description: 'Joined startup as Senior Data Scientist',
            },
          ],
          email: 'diana.chen@email.com',
          phoneNumber: '+1-555-0789',
          education: 'Stanford University - Data Science (MS), University of Chicago - Statistics (BS)',
          maritalStatus: 'Single',
          bio: 'Data scientist passionate about using AI and machine learning to solve real-world problems.',
        },
        {
          name: 'Edward',
          age: 42,
          location: 'Toronto',
          occupation: 'Marketing Director',
          placeOfBirth: 'Vancouver, BC',
          hobbies: ['Ice Hockey', 'Woodworking', 'Craft Beer', 'Camping'],
          lifeEvents: [
            {
              event: 'Graduated University',
              date: '2004-06-01',
              description: 'University of British Columbia - Marketing',
            },
            {
              event: 'First Job',
              date: '2004-09-01',
              description: 'Marketing Coordinator at Local Agency',
            },
            {
              event: 'Marriage',
              date: '2009-08-15',
              description: 'Married to Sarah Thompson in mountain wedding',
            },
            {
              event: 'Child Birth',
              date: '2012-04-22',
              description: 'Welcome son Michael to the family',
            },
            {
              event: 'Child Birth',
              date: '2015-09-30',
              description: 'Welcome daughter Emily to the family',
            },
            {
              event: 'Promotion',
              date: '2018-01-01',
              description: 'Promoted to Marketing Director',
            },
            {
              event: 'Moved to Toronto',
              date: '2019-06-01',
              description: 'Relocated for director position at Fortune 500 company',
            },
          ],
          email: 'edward.thompson@email.com',
          phoneNumber: '+1-416-555-0234',
          education: 'University of British Columbia - Marketing (BBA)',
          maritalStatus: 'Married',
          bio: 'Seasoned marketing professional with expertise in brand strategy and digital transformation.',
        },
      ];

      await this.userInfoModel.insertMany(sampleUsers);
      this.logger.log(`Successfully seeded ${sampleUsers.length} users`);
    } catch (error) {
      this.logger.error('Error seeding users:', error);
      throw error;
    }
  }
}