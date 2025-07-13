import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class DeepseekService {
  private readonly logger = new Logger(DeepseekService.name)
}
