import { Module } from '@nestjs/common'
import { ChatBotService } from './chat-bot.service'
import { ChatBotController } from './chat-bot.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import {
  ChatHistoryUserEntity,
  ChatHistoryUserSchema,
} from './entities/user-entity'
import { MongoHistoryChatModule } from '../app-history/mongo-history-chat/mongo-history-chat.module'

@Module({
  imports: [
    MongoHistoryChatModule,
    MongooseModule.forFeatureAsync([
      {
        name: ChatHistoryUserEntity.name,
        useFactory: () => ChatHistoryUserSchema,
      },
    ]),

    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('DATABASE_MONGO_URI'),
        driverInfo: {
          name: 'Langchaing',
        },
        ssl: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatBotController],
  providers: [ChatBotService],
})
export class ChatBotModule {}
