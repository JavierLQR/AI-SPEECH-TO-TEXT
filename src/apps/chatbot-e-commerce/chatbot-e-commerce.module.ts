import { Module } from '@nestjs/common'
import { ChatbotECommerceService } from './chatbot-e-commerce.service'
import { ChatbotECommerceController } from './chatbot-e-commerce.controller'
import { PineconeModule } from 'src/modules/app-history/pinecone/pinecone.module'

@Module({
  imports: [PineconeModule],
  controllers: [ChatbotECommerceController],
  providers: [ChatbotECommerceService],
})
export class ChatbotECommerceModule {}
