import { ZodError } from 'zod';
import type { ErrorPayload } from '@shared/ipc/schemas';

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
      retryable: error.retryable
    };
  }

  if (error instanceof ZodError) {
    return {
      code: 'INVALID_PAYLOAD',
      message: error.issues.map((issue) => issue.message).join(', '),
      retryable: false
    };
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: 'Une erreur interne est survenue.',
      retryable: false
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Une erreur inconnue est survenue.',
    retryable: false
  };
};
