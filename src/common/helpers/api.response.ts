import { HttpStatus } from '@nestjs/common'

type ApiResponse<T> = {
  message: string
  data?: T
  statusCode?: number
  service?: string
}

export const ApiResponse = <T>({
  message,
  data,
  statusCode = HttpStatus.OK,
  service,
}: ApiResponse<T>) => ({
  statusCode,
  message,
  service,
  data,
  timestamp: new Date().toISOString(),
})
