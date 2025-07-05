import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from 'nestjs-prisma'
import { AiQwenModule } from './ai-qwen/ai-qwen.module'
import { ChatModule } from './chat/chat.module'
import { EmbeddingsProductsModule } from './embeddings-products/embeddings-products.module'
import { GeminiSpeechModule } from './gemini-speech/gemini-speech.module'
import { GroqCloudModule } from './groq-cloud/speech-to-text-and-text-to-speech/groq-cloud.module'
import { DeepseekModule } from './ia-lanchaing/deepseek/deepseek.module'
import { IaLanchaingModule } from './ia-lanchaing/mistral/ia-lanchaing.module'
import { IaMistralModule } from './ia-mistral/ia-mistral.module'
import { LanchaingHistoryMemoryModule } from './lanchaing-history-memory/lanchaing-history-memory.module'
import { LanchaingMemoryPostgresModule } from './lanchaing-memory-postgres/lanchaing-memory-postgres.module'
import { MitralVisionModule } from './mitral-vision/mitral-vision.module'
import { PineconeModule } from './pinecone/pinecone.module'
import { SpeedToTextModule } from './speed-to-text/speed-to-text.module'

import { RedisModule } from '@nestjs-modules/ioredis'
import { PineconeProductsQuerysModule } from './pinecone-products-querys/pinecone-products-querys.module'
import { FireworksAiModule } from './fireworks-ai/fireworks-ai.module'
import { MitralStreamingsModule } from './mitral-streamings/mitral-streamings.module'
import { MemoryMongodbModule } from './memory-mongodb/memory-mongodb.module'
@Module({
  imports: [
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
  ],
  controllers: [],
})
export class AppModule {}
