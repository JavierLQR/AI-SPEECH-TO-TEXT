import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common'
import { IaMistralService } from './ia-mistral.service'

@Controller('ia-mistral')
export class IaMistralController {
  constructor(private readonly iaMistralService: IaMistralService) {}

  @Get()
  findAll() {
    return this.iaMistralService.findAll()
  }

  @Get('/products')
  findAllProducts(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.iaMistralService.findAllProducts(page, limit)
  }
}
