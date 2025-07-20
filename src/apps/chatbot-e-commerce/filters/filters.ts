import { Injectable } from '@nestjs/common'
import { ProjectionType } from 'mongoose'
import { ChatHistoryUserEntity } from 'src/modules/chat-bot/entities/user-entity'

@Injectable()
export class FilterFindHistoryService {
  get projection(): ProjectionType<ChatHistoryUserEntity> {
    return {
      _id: true,
      sessionId: true,
      content: true,
      role: true,
      isUser: true,
      userId: true,
      createdAt: true,
    }
  }
}
