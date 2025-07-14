import { Controller, Get, Query } from '@nestjs/common'
import { ChatBotService } from './chat-bot.service'

@Controller({
  path: 'chat-bot',
  version: '1',
})
export class ChatBotController {
  constructor(private readonly chatBotService: ChatBotService) {}

  @Get()
  getMessages(@Query('text') text: string) {
    return this.chatBotService.getMessages(text)
  }
}
