import { Controller, Get } from '@nestjs/common'
import { SpeedToTextService } from './speed-to-text.service'

@Controller('speed-to-text')
export class SpeedToTextController {
  constructor(private readonly speedToTextService: SpeedToTextService) {}

  @Get()
  findAll() {
    return this.speedToTextService.findAll()
  }
}
