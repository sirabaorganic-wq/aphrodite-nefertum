import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Augment Express Request type definition to include correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      user?: {
        id: string;
        email: string;
        role: 'ADMIN' | 'CONSUMER';
      };
    }
  }
}

export function requestTracing(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}
