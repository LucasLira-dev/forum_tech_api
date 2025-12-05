import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileController } from './profile/profile.controller';
import { ProfileModule } from './profile/profile.module';
import { ProfileService } from './profile/profile.service';
import { PrismaService } from './database/prisma.service';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';
import { TopicModule } from './topic/topic.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProfileModule,
    UploadModule,
    TopicModule,
    CommentsModule,
  ],
  controllers: [AppController, ProfileController],
  providers: [AppService, ProfileService, PrismaService],
})
export class AppModule {}
