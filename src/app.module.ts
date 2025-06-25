import { Module } from '@nestjs/common'
import { ChatModule } from './chat/chat.module'
import { PrismaModule } from 'nestjs-prisma'
import { ConfigModule } from '@nestjs/config'
import { IaMistralModule } from './ia-mistral/ia-mistral.module'
import { IaLanchaingModule } from './ia-lanchaing/mistral/ia-lanchaing.module'
import { SpeedToTextModule } from './speed-to-text/speed-to-text.module'
import { DeepseekModule } from './ia-lanchaing/deepseek/deepseek.module'
import { GroqCloudModule } from './groq-cloud/speech-to-text-and-text-to-speech/groq-cloud.module'
import { AiQwenModule } from './ai-qwen/ai-qwen.module'
import { PineconeModule } from './pinecone/pinecone.module'
import { MitralVisionModule } from './mitral-vision/mitral-vision.module';
@Module({
  imports: [
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
