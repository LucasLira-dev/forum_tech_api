import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileController } from './profile/profile.controller';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [ProfileModule],
  controllers: [AppController, ProfileController],
  providers: [AppService],
})
export class AppModule {}
