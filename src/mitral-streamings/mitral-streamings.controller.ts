import { Controller, Get, Query } from '@nestjs/common'
import { MitralStreamingsService } from './mitral-streamings.service'

@Controller('mitral-streamings')
export class MitralStreamingsController {
  constructor(
    private readonly mitralStreamingsService: MitralStreamingsService,
  ) {}

  @Get('chat')
  getPrompt(@Query('text') text: string) {
    return this.mitralStreamingsService.getPrompt(text)
  }

  @Get('chains')
  getChains() {
    return this.mitralStreamingsService.getChains()
  }

  @Get('indexs')
  getIndexs() {
    return this.mitralStreamingsService.getIndexs()
  }
}
