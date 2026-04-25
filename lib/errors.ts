export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code ?? `ERR_${statusCode}`;
    if (Error.captureStackTrace) Error.captureStackTrace(this, AppError);
  }
}
export function isAppError(error: unknown): error is AppError { return error instanceof AppError; }
export const Errors = {
  unauthorized: (msg = 'Authentication required') => new AppError(msg, 401, 'ERR_UNAUTHORIZED'),
  forbidden: (msg = 'Access denied') => new AppError(msg, 403, 'ERR_FORBIDDEN'),
  notFound: (resource = 'Resource') => new AppError(`${resource} not found`, 404, 'ERR_NOT_FOUND'),
  badRequest: (msg: string) => new AppError(msg, 400, 'ERR_BAD_REQUEST'),
  tooManyRequests: (retryAfter: number) => new AppError(`Rate limit exceeded. Retry after ${retryAfter}s`, 429, 'ERR_RATE_LIMIT'),
  internal: (msg = 'An unexpected error occurred') => new AppError(msg, 500, 'ERR_INTERNAL'),
};
