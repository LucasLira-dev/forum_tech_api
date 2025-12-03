import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class TopicService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTopicDto: CreateTopicDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.banned) {
      if (user.banExpires && user.banExpires > new Date()) {
        throw new UnauthorizedException(
          `User is banned until ${user.banExpires.toISOString()}. Reason: ${user.banReason || 'No reason provided'}`,
        );
      } else if (!user.banExpires) {
        throw new UnauthorizedException(
          `User is permanently banned. Reason: ${user.banReason || 'No reason provided'}`,
        );
      }
    }

    if (!user.profile) {
      throw new NotFoundException('User has no profile');
    }

    const topic = await this.prisma.topic.create({
      data: {
        ...createTopicDto,
        userId,
      },
    });

    return topic;
  }

  async findAll() {
    const topics = await this.prisma.topic.findMany({
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return topics.map(({ _count, ...topic }) => ({
      ...topic,
      commentCount: _count.comments,
    }));
  }

  async findOne(topicId: string) {
    return this.prisma.topic.findUnique({
      where: { topicId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        comments: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return await this.prisma.topic.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUserName(userName: string) {
    if (!userName?.trim()) {
      throw new NotFoundException('Nome de usuário inválido');
    }

    const profile = await this.prisma.profile.findFirst({
      where: {
        userName: userName.trim(),
        isPublic: true,
        user: {
          banned: false,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Perfil público não encontrado para este usuário',
      );
    }

    return await this.prisma.topic.findMany({
      where: {
        userId: profile.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async searchTopic(query?: string) {
    const sanitizedQuery = query?.trim();

    if (!sanitizedQuery) {
      return this.findAll();
    }

    const queryLower = sanitizedQuery.toLowerCase();
    const queryUpper = sanitizedQuery.toUpperCase();
    const queryCapitalized =
      sanitizedQuery.charAt(0).toUpperCase() +
      sanitizedQuery.slice(1).toLowerCase();

    const topics = await this.prisma.topic.findMany({
      where: {
        OR: [
          {
            title: {
              contains: sanitizedQuery,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: sanitizedQuery,
              mode: 'insensitive',
            },
          },
          {
            technologies: {
              hasSome: [queryLower, queryUpper, queryCapitalized],
            },
          },
        ],
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return topics.map(({ _count, ...topic }) => ({
      ...topic,
      commentCount: _count.comments,
    }));
  }

  async update(
    topicId: string,
    updateTopicDto: UpdateTopicDto,
    currentUserId: string,
  ) {
    const existingTopic = await this.findOne(topicId);

    if (!existingTopic) {
      throw new NotFoundException('Tópico não encontrado');
    }

    if (existingTopic.userId !== currentUserId) {
      throw new UnauthorizedException(
        'Você não tem permissão para editar este tópico',
      );
    }

    await this.prisma.topic.update({
      where: {
        topicId: topicId,
      },
      data: {
        ...updateTopicDto,
      },
    });

    return this.findOne(topicId);
  }

  async remove(topicId: string, currentUserId: string) {
    const existingTopic = await this.findOne(topicId);

    if (!existingTopic) {
      throw new NotFoundException('Tópico não encontrado');
    }

    if (existingTopic.userId !== currentUserId) {
      throw new UnauthorizedException(
        'Você não tem permissão para deletar este tópico',
      );
    }

    await this.prisma.topic.delete({
      where: {
        topicId: topicId,
      },
    });

    return { message: 'Tópico removido com sucesso' };
  }
}
