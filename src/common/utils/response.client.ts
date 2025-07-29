import { HttpStatus } from '@nestjs/common'

type Response<T> = {
  message: string
  data?: T
  statusCode?: number
  service?: string
}

const ApiResponse = <T>({
  message,
  data,
  statusCode = HttpStatus.OK,
  service,
}: Response<T>) => ({
  statusCode,
  message,
  service,
  data,
  timestamp: new Date().toISOString(),
})

export default ApiResponse
