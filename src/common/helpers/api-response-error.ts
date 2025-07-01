import { HttpStatus } from '@nestjs/common'

interface ErrorResponseOptions {
  message: string
  statusCode?: number
  service?: string
  path?: string
}

export const ErrorResponse = ({
  message,
  statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
  service,
  path,
}: ErrorResponseOptions) => ({
  statusCode,
  message,
  service,
  path,
  timestamp: new Date().toISOString(),
})
