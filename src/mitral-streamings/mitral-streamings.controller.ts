import { Controller, Get } from '@nestjs/common'
import { MitralStreamingsService } from './mitral-streamings.service'

@Controller('mitral-streamings')
export class MitralStreamingsController {
  constructor(
    private readonly mitralStreamingsService: MitralStreamingsService,
  ) {}

  @Get('chat')
  getPrompt() {
    return this.mitralStreamingsService.getPrompt()
  }

  @Get('chains')
  getChains() {
    return this.mitralStreamingsService.getChains()
  }
}
