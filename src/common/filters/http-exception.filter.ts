import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ErrorResponse } from 'src/common/helpers/api-response-error'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(HttpExceptionFilter.name)
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    const isHttpException = exception instanceof HttpException
    this.logger.error({
      exception,
      exceptionResponse: isHttpException,
      typeError: typeof exception,
    })
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : 'Internal server error'
    console.log({
      exceptionResponse,
      status,
    })

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : typeof exceptionResponse === 'object' &&
            exceptionResponse !== null &&
            'message' in exceptionResponse
          ? (exceptionResponse as { message: string }).message
          : 'Unexpected error'

    const service =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'service' in exceptionResponse &&
      typeof (exceptionResponse as { service?: unknown }).service === 'string'
        ? (exceptionResponse as { service: string }).service
        : 'GlobalExceptionFilter'

    const errorPayload = ErrorResponse({
      statusCode: status,
      message,
      path: request.url,
      service,
    })

    response.status(status).json(errorPayload)
  }
}
