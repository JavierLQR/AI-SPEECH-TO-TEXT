import { Body, Controller, Post } from '@nestjs/common'
import { OpenaiService } from './openai.service'

@Controller({
  path: 'openai',
  version: '1',
})
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('/chat')
  chat(@Body() createOpenaiDto: { prompt: string }) {
    return this.openaiService.chat(createOpenaiDto.prompt)
  }
}
