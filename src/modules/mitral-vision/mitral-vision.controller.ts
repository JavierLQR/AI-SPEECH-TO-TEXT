import { Controller, Get } from '@nestjs/common'
import { MitralVisionService } from './mitral-vision.service'

@Controller('mitral-vision')
export class MitralVisionController {
  constructor(private readonly mitralVisionService: MitralVisionService) {}

  @Get('/describe-image')
  public describeImage() {
    return this.mitralVisionService.describeImage()
  }
}
