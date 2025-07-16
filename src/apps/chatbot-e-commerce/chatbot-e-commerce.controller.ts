import { Controller, Get, Query } from '@nestjs/common'
import { ChatbotECommerceService } from './chatbot-e-commerce.service'

@Controller({
  version: '1',
  path: 'chatbot-e-commerce',
})
export class ChatbotECommerceController {
  constructor(
    private readonly chatbotECommerceService: ChatbotECommerceService,
  ) {}

  @Get('create-index')
  async createIndex(@Query('name') name: string) {
    return await this.chatbotECommerceService.createIndex(name)
  }

  @Get('insert-data-in-index')
  insertAllProductsInIndex(@Query('name') name: string) {
    return this.chatbotECommerceService.insertAllProductsInIndex(name)
  }
}
