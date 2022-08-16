import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export default class HttpExceptionFilter implements ExceptionFilter {
  private isHttpException(exception: unknown): exception is HttpException {
    return exception instanceof HttpException;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.isHttpException(exception)
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (this.isHttpException(exception)) {
      const errorResponse = exception.getResponse() as { message: any };
      return response.status(status).json({
        status: 'fail',
        statusCode: status,
        data:
          typeof errorResponse === 'string'
            ? [errorResponse]
            : typeof errorResponse.message === 'string'
            ? [errorResponse.message]
            : errorResponse.message,
      });
    }

    return response.status(status).json({
      status: 'error',
      statusCode: status,
      message: 'Internal server error',
    });
  }
}
