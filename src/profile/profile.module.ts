import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { PrismaService } from '../database/prisma.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  providers: [ProfileService, PrismaService],
})
export class ProfileModule {}
