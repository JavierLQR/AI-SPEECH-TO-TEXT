import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { PusherService } from './pusher.service'
import * as Pusher from 'pusher'

jest.mock('pusher')

describe('PusherService', () => {
  let service: PusherService
  let configService: ConfigService

  const mockConfigService = {
    getOrThrow: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PusherService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<PusherService>(PusherService)
    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should initialize Pusher with correct config values', () => {
    mockConfigService.getOrThrow
      .mockReturnValueOnce('app-id')
      .mockReturnValueOnce('key')
      .mockReturnValueOnce('secret')
      .mockReturnValueOnce('cluster')
      .mockReturnValueOnce(true)

    new PusherService(configService)

    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('PUSHER_APP_ID')
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('PUSHER_KEY')
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('PUSHER_SECRET')
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('PUSHER_CLUSTER')
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('PUSHER_USE_TLS')
    expect(Pusher).toHaveBeenCalledWith({
      appId: 'app-id',
      key: 'key',
      secret: 'secret',
      cluster: 'cluster',
      useTLS: true,
    })
  })
})
