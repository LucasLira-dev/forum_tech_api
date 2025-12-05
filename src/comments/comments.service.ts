import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const existingTopic = await this.prisma.topic.findUnique({
      where: {
        topicId: createCommentDto.topicId,
      },
    });

    if (!existingTopic) {
      throw new NotFoundException(`Tópico não encontrado`);
    }

    const existingProfile = await this.prisma.profile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!existingProfile) {
      throw new NotFoundException(`Perfil não encontrado`);
    }

    const newComment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        userId,
        topicId: createCommentDto.topicId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    return newComment;
  }

  async findAllCommentsByUser(userId: string) {
    return await this.prisma.comment.findMany({
      where: {
        userId,
      },
      include: {
        topic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByTopicId(topicId: string) {
    const comments = await this.prisma.comment.findMany({
      where: {
        topicId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments;
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comentário não encontrado`);
    }

    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    currentUserId: string,
  ) {
    const existingComment = await this.findOne(id);

    if (existingComment.userId !== currentUserId) {
      throw new ForbiddenException(
        `Você não tem permissão para atualizar este comentário`,
      );
    }

    await this.prisma.comment.update({
      where: {
        id,
      },
      data: {
        ...updateCommentDto,
      },
    });

    return await this.findOne(id);
  }

  async remove(id: string, currentUserId: string) {
    const existingComment = await this.findOne(id);

    const topic = await this.prisma.topic.findUnique({
      where: {
        topicId: existingComment.topicId,
      },
    });

    const isCommentAuthor = existingComment.userId === currentUserId;
    const isTopicAuthor = topic?.userId === currentUserId;

    if (!isCommentAuthor && !isTopicAuthor) {
      throw new ForbiddenException(
        `Você não tem permissão para remover este comentário`,
      );
    }

    await this.prisma.comment.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Comentário removido com sucesso',
    };
  }
}
