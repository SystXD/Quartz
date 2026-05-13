export enum QuartzErrorCode {
  NOT_FOUND = "NOT_FOUND",
  FAILED = "FAILED",
  INVALID = "INVALID",
}

export class QuartzError extends Error {
  constructor(
    public code: QuartzErrorCode | string,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "QuartzError";
  }
}

export const error = (
  code: QuartzErrorCode | string,
  message: string,
  details?: Record<string, any>,
) => new QuartzError(code, message, details);
