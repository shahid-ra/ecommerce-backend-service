import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Constants } from 'src/utils/constants';

@Catch(HttpException, Error)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException | Error, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const httpStatus = this.getHttpStatusCode(exception);

    const httpMessage = this.getHttpMessage(exception, request);

    const responseBody = {
      status: Constants.HTTP_RESPONSE_STATUS.FAILED,
      message: httpMessage,
    };

    return httpAdapter.reply(response, responseBody, httpStatus);
  }

  getHttpStatusCode(exception) {
    if (exception?.isJoi) {
      return HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception?.status) {
      return exception?.status;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  getHttpMessage(exception, request: Request) {
    const errorType = exception?.constructor.name;
    if (exception instanceof TypeError || errorType === 'CastError') {
      return Constants.DEFAULT_ERROR_MSG.replace(
        '@{{uuid}}',
        request?.headers?.['x-request-id'],
      );
    }
    return (
      exception?.response?.message ||
      exception?.message ||
      Constants.DEFAULT_ERROR_MSG.replace(
        '@{{uuid}}',
        request?.headers?.['x-request-id'],
      )
    );
  }
}
