import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError } from '../utils/customError.js';
import { logger } from '../utils/logger.js';

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const correlationId = req.correlationId || 'none';
  
  // 1. Handle Custom HTTP Errors
  if (err instanceof HttpError) {
    logger.warn({
      message: `${req.method} ${req.url} - HttpError ${err.statusCode}: ${err.message}`,
      correlationId,
    });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      correlationId,
    });
  }

  // 2. Handle Zod Validation Errors
  if (err instanceof ZodError) {
    logger.warn({
      message: `${req.method} ${req.url} - ValidationError: Zod validation failed`,
      correlationId,
      details: err.errors,
    });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
      correlationId,
    });
  }

  // 3. Handle Prisma Database Client Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g. duplicate email/SKU)
    if (err.code === 'P2002') {
      const targets = (err.meta?.target as string[]) || [];
      const field = targets.join(', ');
      logger.warn({
        message: `Database constraint violation on field: ${field}`,
        correlationId,
      });
      return res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists.`,
        correlationId,
      });
    }

    // Record not found
    if (err.code === 'P2025') {
      logger.warn({
        message: `Database record not found: ${err.message}`,
        correlationId,
      });
      return res.status(404).json({
        success: false,
        message: 'The requested database record was not found.',
        correlationId,
      });
    }
  }

  // 4. Handle generic unhandled internal errors
  logger.error({
    message: `${req.method} ${req.url} - InternalServerError: ${err.message}`,
    correlationId,
    stack: err.stack,
  });

  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred.' 
      : err.message,
    correlationId,
  });
}
