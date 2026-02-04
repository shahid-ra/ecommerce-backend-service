export namespace Constants {
  export const DEFAULT_ERROR_MSG =
    'Something went wrong, please contact support with UUID: @{{uuid}}';

  export const DEFAULT_NOT_FOUND_ERROR_MSG =
    'The resource which you are trying to access is not found in our system.';

  export enum HTTP_RESPONSE_STATUS {
    SUCCESS = 'success',
    FAILED = 'failed',
  }
}
