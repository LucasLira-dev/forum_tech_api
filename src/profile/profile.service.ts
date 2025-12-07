import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findMyProfile(userId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    return profile;
  }

  async getUserProfileByUserName(userName: string) {
    const profile = await this.prisma.profile.findFirst({
      where: {
        userName,
        isPublic: true,
      },
      include: {
        user: {
          include: {
            topics: true,
            comments: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    if (!profile.isPublic) {
      throw new NotFoundException('Perfil não encontrado');
    }

    return profile;
  }

  async upsertProfile(profileDto: UpdateProfileDto, userId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const existingProfile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    if (profileDto.userName) {
      const userNameExists = await this.prisma.profile.findFirst({
        where: {
          userName: profileDto.userName,
        },
      });

      if (userNameExists && userNameExists.id !== userId) {
        throw new NotFoundException('Nome de usuário já em uso');
      }
    }

    if (existingProfile) {
      if (profileDto.avatarUrl && existingProfile.avatarUrl) {
        try {
          await this.uploadService.deleteImage(existingProfile.avatarUrl);
        } catch (error) {
          const reason =
            error instanceof Error ? error.message : 'Erro desconhecido';
          console.error('Erro ao deletar avatar antigo:', reason);
        }
      }

      if (profileDto.capaUrl && existingProfile.capaUrl) {
        try {
          await this.uploadService.deleteImage(existingProfile.capaUrl);
        } catch (error) {
          const reason =
            error instanceof Error ? error.message : 'Erro desconhecido';
          console.error('Erro ao deletar capa antiga:', reason);
        }
      }
    }

    if (!existingProfile && !profileDto.userName) {
      throw new BadRequestException(
        'Finalize o perfil (userName) antes de enviar imagens.',
      );
    }

    const userName = profileDto.userName ?? existingProfile?.userName ?? '';

    const profile = await this.prisma.profile.upsert({
      where: {
        userId: userId,
      },
      create: {
        userId,
        userName,
        bio: profileDto.bio,
        avatarUrl: profileDto.avatarUrl,
        capaUrl: profileDto.capaUrl,
      },
      update: {
        userName,
        bio: profileDto.bio,
        avatarUrl: profileDto.avatarUrl,
        capaUrl: profileDto.capaUrl,
      },
    });

    return profile;
  }

  async updateProfileVisibility(isPublic: boolean, userId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    await this.prisma.profile.update({
      where: { userId },
      data: { isPublic },
    });

    return { message: 'Visibilidade do perfil atualizada com sucesso' };
  }
}
