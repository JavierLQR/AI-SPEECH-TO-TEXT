import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import Pusher from 'pusher'

import { AuthPusherDto } from './dto/auth-pusher.dto'
import { SendMessagePusherDto } from './dto/send-message-pusher.dto'
import { PusherService } from './pusher.service'
import { ConfigService } from '@nestjs/config'

// Mock de métodos de instancia de Pusher
const mockTrigger = jest.fn()
const mockAuthorizeChannel = jest.fn()

jest.mock('pusher', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      trigger: mockTrigger,
      authorizeChannel: mockAuthorizeChannel,
    })),
  }
})

describe('PusherService', () => {
  let service: PusherService

  const mockConfigService = {
    getOrThrow: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    mockConfigService.getOrThrow
      .mockReturnValueOnce('app-id')
      .mockReturnValueOnce('key')
      .mockReturnValueOnce('secret')
      .mockReturnValueOnce('cluster')
      .mockReturnValueOnce(true)

    const module: TestingModule = await Test.createTestingModule({
      providers: [PusherService],
    }).compile()

    service = module.get<PusherService>(PusherService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should initialize Pusher with correct config values', () => {
    expect(Pusher).toHaveBeenCalledWith({
      appId: 'app-id',
      key: 'key',
      secret: 'secret',
      cluster: 'cluster',
      useTLS: true,
    })
  })

  describe('trigger', () => {
    it('should call pusher.trigger and return response', async () => {
      const dto: SendMessagePusherDto = {
        channelName: 'test-channel',
        eventName: 'test-event',
        data: {
          id: '1',
          message: 'Hello, world!',
          userId: 'user123',
          timestamp: new Date().toISOString(),
        },
        socket_id: '1.2',
        userId: 'user123',
      }

      mockTrigger.mockResolvedValueOnce({ status: 'ok' })

      const result = await service.trigger(dto)

      expect(mockTrigger).toHaveBeenCalledWith(
        dto.channelName,
        dto.eventName,
        dto.data,
      )
      expect(result.message).toBe('Channel triggered successfully')
      expect(result.data).toEqual({ status: 'ok' })
    })
  })

  describe('authorizeChannel', () => {
    it('should authorize public channel without validation', () => {
      const dto: AuthPusherDto = {
        socket_id: '123.456',
        channel_name: 'public-room',
      }

      mockAuthorizeChannel.mockReturnValueOnce({ auth: 'fake-auth-token' })

      const result = service.authorizeChannel(dto, 'user123')

      expect(mockAuthorizeChannel).toHaveBeenCalledWith(
        dto.socket_id,
        dto.channel_name,
      )
      expect(result.message).toBe('Authorized')
      expect(result.data?.auth).toBe('fake-auth-token')
    })

    it('should authorize private channel if user is valid', () => {
      const dto: AuthPusherDto = {
        socket_id: '123.456',
        channel_name: 'private-user-user123',
      }

      mockAuthorizeChannel.mockReturnValueOnce({ auth: 'private-auth-token' })

      const result = service.authorizeChannel(dto, 'user123')

      expect(result.message).toBe('Authorized')
      expect(result.data?.auth).toBe('private-auth-token')
    })

    it('should throw UnauthorizedException for invalid user in private channel', () => {
      const dto: AuthPusherDto = {
        socket_id: '123.456',
        channel_name: 'private-user-otherUser',
      }

      expect(() => service.authorizeChannel(dto, 'user123')).toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('typeChannel', () => {
    it('should return correct channel type', () => {
      const channels = {
        'presence-user-1': 'presence',
        'private-user-1': 'private',
        'public-room': 'public',
        'unknown-channel': 'public',
      }

      for (const [channel, expected] of Object.entries(channels)) {
        expect(service['typeChannel'](channel)).toBe(expected)
      }
    })
  })

  describe('validateUserIdForChannel', () => {
    it('should return true if userId is valid in channel', () => {
      const result = service['validateUserIdForChannel'](
        'private-user-123',
        '123',
      )
      expect(result).toBe(true)
    })

    it('should throw if userId is not valid in channel', () => {
      expect(() =>
        service['validateUserIdForChannel']('private-user-xyz', '123'),
      ).toThrow(UnauthorizedException)
    })
  })
})
