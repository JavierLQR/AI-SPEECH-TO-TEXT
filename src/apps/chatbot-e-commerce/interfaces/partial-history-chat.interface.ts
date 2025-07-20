import { ChatHistoryUserEntity } from 'src/modules/chat-bot/entities/user-entity'

export type PartialHistoryChat = Pick<
  ChatHistoryUserEntity,
  | 'sessionId'
  | 'userQuestion'
  | 'assistantResponse'
  | 'userId'
  | 'messageId'
  | '_id'
>
