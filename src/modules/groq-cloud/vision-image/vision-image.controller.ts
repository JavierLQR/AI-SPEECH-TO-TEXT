import { Controller } from '@nestjs/common'
import { VisionImageService } from './vision-image.service'

@Controller('vision-image')
export class VisionImageController {
  constructor(private readonly visionImageService: VisionImageService) {}
}
