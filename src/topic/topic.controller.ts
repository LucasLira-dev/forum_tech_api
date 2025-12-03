import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import {
  AllowAnonymous,
  Session,
  UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post('create')
  create(
    @Session() session: UserSession,
    @Body() createTopicDto: CreateTopicDto,
  ) {
    return this.topicService.create(createTopicDto, session.user.id);
  }

  @AllowAnonymous()
  @Get('allTopics')
  findAll() {
    return this.topicService.findAll();
  }

  @AllowAnonymous()
  @Get('search')
  search(@Query('q') query: string) {
    return this.topicService.searchTopic(query);
  }

  @AllowAnonymous()
  @Get('user/:userName')
  findByUserName(@Param('userName') userName: string) {
    return this.topicService.findByUserName(userName);
  }

  @Get('topicsByUser')
  findByUser(@Session() session: UserSession) {
    return this.topicService.findByUserId(session.user.id);
  }

  @AllowAnonymous()
  @Get(':topicId')
  findOne(@Param('topicId') topicId: string) {
    return this.topicService.findOne(topicId);
  }

  @Patch(':topicId')
  update(
    @Param('topicId') topicId: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @Session() session: UserSession,
  ) {
    return this.topicService.update(topicId, updateTopicDto, session.user.id);
  }

  @Delete(':topicId')
  remove(@Param('topicId') topicId: string, @Session() session: UserSession) {
    return this.topicService.remove(topicId, session.user.id);
  }
}
