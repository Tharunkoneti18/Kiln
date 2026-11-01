import { NextResponse } from 'next/server';

export enum ApiErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    request_id: string;
    details?: Record<string, unknown>;
  };
}

export function apiError(
  code: ApiErrorCode | string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): Response {
  const requestId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const body: ApiErrorBody = {
    error: {
      code,
      message,
      request_id: requestId,
      ...(details ? { details } : {}),
    },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
    },
  });
}

export class AppError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    status: number = 400,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function createErrorResponse(err: any, defaultStatus: number = 500): Response {
  const status = typeof err?.status === 'number' ? err.status : defaultStatus;
  const code = err?.code || ApiErrorCode.INTERNAL_ERROR;
  const message = err?.message || 'Internal server error';
  const details = err?.details;

  return apiError(code, message, status, details);
}

export function createValidationErrorResponse(zodError: any): Response {
  return apiError(
    ApiErrorCode.UNPROCESSABLE_ENTITY,
    'Validation failed',
    400,
    zodError?.format ? zodError.format() : { error: String(zodError) }
  );
}

