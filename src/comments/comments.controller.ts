import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('create')
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Session() session: UserSession,
  ) {
    return this.commentsService.create(createCommentDto, session.user.id);
  }

  @Get('my-comments')
  findAll(@Session() session: UserSession) {
    return this.commentsService.findAllCommentsByUser(session.user.id);
  }

  @Get('by-topic/:topicId')
  findAllByTopic(@Param('topicId') topicId: string) {
    return this.commentsService.findByTopicId(topicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch('updateComment/:id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Session() session: UserSession,
  ) {
    return this.commentsService.update(id, updateCommentDto, session.user.id);
  }

  @Delete('deleteComment/:id')
  remove(@Param('id') id: string, @Session() session: UserSession) {
    return this.commentsService.remove(id, session.user.id);
  }
}
