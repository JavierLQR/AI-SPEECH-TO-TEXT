import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common'
import { AppHistoryService } from './app-history.service'

@Controller({
  path: 'app-history',
})
export class AppHistoryController {
  constructor(private readonly appHistoryService: AppHistoryService) {}

  @Get('create-index')
  @HttpCode(HttpStatus.CREATED)
  async createIndex(@Query('name') name: string) {
    return await this.appHistoryService.createIndex(name)
  }

  @Get('get-index')
  @HttpCode(HttpStatus.CREATED)
  insertDataInIndex(
    @Query('name') name: string,
    @Query('namespace') namespace: string,
  ) {
    return this.appHistoryService.getIndex(name, namespace)
  }

  @Get('insert-data')
  @HttpCode(HttpStatus.CREATED)
  async insertData(
    @Query('name') name: string,
    @Query('namespace') namespace: string,
  ) {
    return await this.appHistoryService.insertDataInIndex(name, namespace)
  }

  @Get('chat-index')
  @HttpCode(HttpStatus.OK)
  chatIndex(@Query('text') text: string) {
    return this.appHistoryService.chatIndex(text)
  }
}
