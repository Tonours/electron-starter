import type { ErrorPayload } from '@shared/ipc/schemas';
import { ZodError } from 'zod';

export class AppError extends Error {
  readonly code: string;
  readonly retryable: boolean;

  constructor(code: string, message: string, retryable = false) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.retryable = retryable;
  }
}

export const toErrorPayload = (error: unknown): ErrorPayload => {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
    };
  }

  if (error instanceof ZodError) {
    return {
      code: 'INVALID_PAYLOAD',
      message: error.issues.map((issue) => issue.message).join(', '),
      retryable: false,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred.',
      retryable: false,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred.',
    retryable: false,
  };
};
