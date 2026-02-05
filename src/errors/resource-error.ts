import { HttpException, HttpStatus } from '@nestjs/common';

export interface FieldError {
  field?: string;
  error: string;
  value: any;
}

export class ResourceError extends Error {
  errorObject: {
    fieldErrors: FieldError[];
    error: string;
  };

  status: number;

  constructor(message: string, fieldErrors: FieldError[]) {
    super(message);
    this.name = 'RESOURCE_ERROR';
    this.status = 500;
    this.errorObject = {
      fieldErrors,
      error: message,
    };
  }
}

export class ForbiddenError extends Error {}
export class NotFoundError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = 'NOT_FOUND';
    this.status = 404;
  }
}
export class UnauthorizedError extends Error {}
export class BadRequestError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = 'BAD_REQUEST';
    this.status = 402;
  }
}
export class UnprocessableError extends Error {}
export class OperationNotAllowedError extends Error {}
export class TooManyRequestError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class ObjectInstantiationError extends Error {}

export class ConflictError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}
