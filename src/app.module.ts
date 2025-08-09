import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from 'nestjs-prisma'
import { RedisModule } from '@nestjs-modules/ioredis'

import { AiQwenModule } from './modules/ai-qwen/ai-qwen.module'
import { ChatModule } from './modules/chat/chat.module'
import { EmbeddingsProductsModule } from './modules/embeddings-products/embeddings-products.module'
import { GeminiSpeechModule } from './modules/gemini-speech/gemini-speech.module'
import { GroqCloudModule } from './modules/groq-cloud/speech-to-text-and-text-to-speech/groq-cloud.module'
import { DeepseekModule } from './modules/ia-lanchaing/deepseek/deepseek.module'
import { IaLanchaingModule } from './modules/ia-lanchaing/mistral/ia-lanchaing.module'
import { IaMistralModule } from './modules/ia-mistral/ia-mistral.module'
import { LanchaingHistoryMemoryModule } from './modules/lanchaing-history-memory/lanchaing-history-memory.module'
import { LanchaingMemoryPostgresModule } from './modules/lanchaing-memory-postgres/lanchaing-memory-postgres.module'
import { MitralVisionModule } from './modules/mitral-vision/mitral-vision.module'
import { PineconeModule } from './modules/pinecone/pinecone.module'
import { SpeedToTextModule } from './modules/speed-to-text/speed-to-text.module'

import { PineconeProductsQuerysModule } from './modules/pinecone-products-querys/pinecone-products-querys.module'
import { FireworksAiModule } from './modules/fireworks-ai/fireworks-ai.module'
import { MitralStreamingsModule } from './modules/mitral-streamings/mitral-streamings.module'
import { MemoryMongodbModule } from './modules/memory-mongodb/memory-mongodb.module'
import { AppHistoryModule } from './modules/app-history/app-history.module'
import { ChatBotModule } from './modules/chat-bot/chat-bot.module'
import { MongooseModule } from '@nestjs/mongoose'
import { DevtoolsModule } from '@nestjs/devtools-integration'
import { MastraCerebrasAiModule } from './modules/mastra-cerebras-ai/mastra-cerebras-ai.module'
import { ChatbotECommerceModule } from './apps/chatbot-e-commerce/chatbot-e-commerce.module'
// import { PusherModule } from './pusher/pusher.module'
import { PusherModule } from './apps/pusher/pusher.module'
import { PushbulletModule } from './modules/pushbullet/pushbullet.module'
import { OpenaiModule } from './openai/openai.module'

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),

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

    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.getOrThrow<string>('REDIS_URL'),
        options: {
          tls: {},
        },
      }),
      inject: [ConfigService],
    }),

    ChatModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        prismaOptions: { log: ['query', 'info', 'warn', 'error'] },
      },
    }),
    IaMistralModule,
    IaLanchaingModule,
    SpeedToTextModule,
    DeepseekModule,
    GroqCloudModule,
    AiQwenModule,
    PineconeModule,
    MitralVisionModule,
    GeminiSpeechModule,
    EmbeddingsProductsModule,
    LanchaingHistoryMemoryModule,
    LanchaingMemoryPostgresModule,
    PineconeProductsQuerysModule,
    FireworksAiModule,
    MitralStreamingsModule,
    MemoryMongodbModule,
    AppHistoryModule,
    ChatBotModule,
    MastraCerebrasAiModule,
    ChatbotECommerceModule,
    PusherModule,
    PushbulletModule,
    OpenaiModule,
  ],
  controllers: [],
})
export class AppModule {}
