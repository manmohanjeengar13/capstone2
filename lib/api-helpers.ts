import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { AppError, isAppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types/api';

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data, error: null } satisfies ApiResponse<T>, { status, headers: { 'X-Request-Id': uuidv4() } });
}
export function err(message: string, status: number): NextResponse {
  return NextResponse.json({ data: null, error: message } satisfies ApiResponse<null>, { status, headers: { 'X-Request-Id': uuidv4() } });
}
export function handleRouteError(error: unknown, context?: string): NextResponse {
  if (isAppError(error)) {
    if (error.statusCode >= 500) logger.error(`API error [${context}]`, { message: error.message, code: error.code });
    return err(error.message, error.statusCode);
  }
  logger.error(`Unexpected error [${context}]`, { error: error instanceof Error ? error.message : String(error) });
  return err('An unexpected error occurred. Please try again.', 500);
}
