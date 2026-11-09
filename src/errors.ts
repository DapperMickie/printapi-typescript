/** Base class for SDK failures. Causes are preserved without logging credentials or bodies. */
export class PrintAPIError extends Error {
  override readonly name: string = 'PrintAPIError';
}

export class APIError extends PrintAPIError {
  override readonly name: string = 'APIError';
  readonly requestId: string | undefined;
  constructor(
    message: string,
    readonly status: number,
    readonly headers: Headers,
    /** Parsed API error, or text when the service did not return JSON. */
    readonly body: unknown,
  ) {
    super(message);
    this.requestId = headers.get('x-request-id') ?? headers.get('request-id') ?? undefined;
  }
}
export class BadRequestError extends APIError { override readonly name = 'BadRequestError'; }
export class AuthenticationError extends APIError { override readonly name = 'AuthenticationError'; }
export class PermissionDeniedError extends APIError { override readonly name = 'PermissionDeniedError'; }
export class NotFoundError extends APIError { override readonly name = 'NotFoundError'; }
export class ConflictError extends APIError { override readonly name = 'ConflictError'; }
export class RateLimitError extends APIError { override readonly name = 'RateLimitError'; }
export class InternalServerError extends APIError { override readonly name = 'InternalServerError'; }
export class ConnectionError extends PrintAPIError { override readonly name = 'ConnectionError'; }
export class TimeoutError extends PrintAPIError { override readonly name = 'TimeoutError'; }
export class RequestAbortedError extends PrintAPIError { override readonly name = 'RequestAbortedError'; }
export class InvalidResponseError extends PrintAPIError { override readonly name = 'InvalidResponseError'; }

export function apiError(response: Response, body: unknown): APIError {
  const message = typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string'
    ? body.message : `PrintAPI returned HTTP ${response.status}`;
  const Type = ({ 400: BadRequestError, 401: AuthenticationError, 403: PermissionDeniedError,
    404: NotFoundError, 409: ConflictError, 422: BadRequestError, 429: RateLimitError } as Record<number, typeof APIError>)[response.status]
    ?? (response.status >= 500 ? InternalServerError : APIError);
  return new Type(message, response.status, response.headers, body);
}
