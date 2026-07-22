import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

// 1. Helmet Security Headers Setup
export const helmetMiddleware = helmet();

// 2. CORS Settings
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map((o) => o.trim()).filter(Boolean);
  }
  // Fallback to localhost only in development
  if (process.env.NODE_ENV !== 'production') {
    return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  }
  return [];
}

const allowedOrigins = getAllowedOrigins();

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS rejected request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
});

// 3. Rate Limiters
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 login/register attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// 4. Custom Deep XSS input sanitization (strips <script> and HTML tags recursively)
function sanitizeString(val: string): string {
  return val
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Strip script tags
    .replace(/<\/?[^>]+(>|$)/g, '') // Strip any remaining HTML tags
    .trim();
}

function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
}

export function xssSanitizer(req: Request, res: Response, next: NextFunction) {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
}
