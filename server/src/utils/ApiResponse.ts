/**
 * Standard JSON response envelope for all successful API responses.
 *
 * Consistent shape across every endpoint:
 *   { success, statusCode, message, data }
 *
 * Usage in a controller:
 *   res.status(HTTP.CREATED).json(new ApiResponse(HTTP.CREATED, MSG.REGISTER_SUCCESS, user));
 */
export class ApiResponse<T> {
  readonly success: boolean;
  readonly statusCode: number;
  readonly message: string;
  readonly data: T;

  constructor(statusCode: number, message: string, data: T) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
