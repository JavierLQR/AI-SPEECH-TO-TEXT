import { Controller, Get } from '@nestjs/common'
import { IaLanchaingService } from './ia-lanchaing.service'

@Controller('ia-lanchaing')
export class IaLanchaingController {
  constructor(private readonly iaLanchaingService: IaLanchaingService) {}

  @Get()
  getPrompt() {
    return this.iaLanchaingService.getPromptModel()
  }

  @Get('index')
  createIndex() {
    return this.iaLanchaingService.createIndex()
  }

  @Get('data-index')
  findAllIndexes() {
    return this.iaLanchaingService.findAllDataIndex()
  }
}
