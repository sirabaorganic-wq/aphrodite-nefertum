import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/customError.js';

interface TokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'CONSUMER';
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set.');
  }
  return secret;
}

export function protect(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token missing or invalid.');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
    
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Authentication token has expired.');
    }
    throw new UnauthorizedError('Authentication token verification failed.');
  }
}

export function looseProtect(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (e) {
      // Fail silently and proceed as guest
    }
  }
  next();
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    throw new UnauthorizedError('User profile details not found.');
  }

  if (req.user.role !== 'ADMIN') {
    throw new ForbiddenError('Access denied. Administrator privileges required.');
  }

  next();
}

