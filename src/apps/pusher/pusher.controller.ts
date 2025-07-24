import { Controller } from '@nestjs/common'
import { PusherService } from './pusher.service'

@Controller({
  version: '1',
  path: 'pusher',
})
export class PusherController {
  constructor(private readonly pusherService: PusherService) {}
}
