import { SetMetadata } from '@nestjs/common'

export const SERVICE_NAME_KEY = 'SERVICE_NAME'

export const ServiceName = (name: string) => SetMetadata(SERVICE_NAME_KEY, name)
