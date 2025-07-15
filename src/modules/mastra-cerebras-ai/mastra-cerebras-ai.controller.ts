import { Controller, Get, Query } from '@nestjs/common'
import { MastraCerebrasAiService } from './mastra-cerebras-ai.service'

@Controller({
  path: 'mastra-cerebras-ai',
})
export class MastraCerebrasAiController {
  constructor(
    private readonly mastraCerebrasAiService: MastraCerebrasAiService,
  ) {}

  @Get('/chat')
  async responderText(@Query('text') pregunta: string) {
    return this.mastraCerebrasAiService.responderText(pregunta)
  }
}
