import { ProfileService } from './profile.service';
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Post,
} from '@nestjs/common';
import {
  AllowAnonymous,
  Session,
  UserSession,
} from '@thallesp/nestjs-better-auth';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly uploadService: UploadService,
  ) {}

  @AllowAnonymous()
  @Get('user/:userName')
  async getUserProfile(@Param('userName') userName: string) {
    return this.profileService.getUserProfileByUserName(userName);
  }

  @Patch('update-visibility')
  updateVisibility(
    @Body('isPublic') isPublic: boolean,
    @Session() userSession: UserSession,
  ) {
    return this.profileService.updateProfileVisibility(
      isPublic,
      userSession.user.id,
    );
  }

  @Get('my-profile')
  findMyProfile(@Session() userSession: UserSession) {
    return this.profileService.findMyProfile(userSession.user.id);
  }

  @Patch('update-profile')
  async upsertProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Session() userSession: UserSession,
  ) {
    return this.profileService.upsertProfile(
      updateProfileDto,
      userSession.user.id,
    );
  }

  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('Apenas imagens são permitidas'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Session() userSession: UserSession,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido ou inválido');
    }

    const avatarUrl = await this.uploadService.uploadImage(
      file,
      userSession.user.id,
    );

    await this.profileService.upsertProfile({ avatarUrl }, userSession.user.id);

    return {
      message: 'Avatar atualizado com sucesso',
      avatarUrl,
    };
  }

  @Post('upload-capa')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('Apenas imagens são permitidas'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadCapa(
    @UploadedFile() file: Express.Multer.File,
    @Session() userSession: UserSession,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido ou inválido');
    }

    const capaUrl = await this.uploadService.uploadImage(
      file,
      userSession.user.id,
    );

    await this.profileService.upsertProfile({ capaUrl }, userSession.user.id);

    return {
      message: 'Capa atualizada com sucesso',
      capaUrl,
    };
  }
}
