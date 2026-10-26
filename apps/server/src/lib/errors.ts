/**
 * An error the client should see. `reason` is a machine-readable code the app branches on
 * (for example 'no-credits', 'suspended', 'not-configured'); responses are `{ error, reason? }`.
 */
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public reason?: string,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, reason?: string) => new AppError(400, message, reason);
export const unauthorized = (message = 'Please sign in', reason?: string) => new AppError(401, message, reason);
export const forbidden = (message: string, reason?: string) => new AppError(403, message, reason);
export const notFound = (message = 'Not found') => new AppError(404, message);
export const conflict = (message: string, reason?: string) => new AppError(409, message, reason);
