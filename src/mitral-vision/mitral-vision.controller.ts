import { Controller } from '@nestjs/common'
import { MitralVisionService } from './mitral-vision.service'

@Controller('mitral-vision')
export class MitralVisionController {
  constructor(private readonly mitralVisionService: MitralVisionService) {}
}
