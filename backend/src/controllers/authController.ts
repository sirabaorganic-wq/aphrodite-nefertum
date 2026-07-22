import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidator.js';
import { logger } from '../utils/logger.js';
import { UnauthorizedError } from '../utils/customError.js';

const COOKIE_NAME = 'refreshToken';

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/', // accessible to refresh route
  });
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      const result = await authService.register(validatedData);
      
      setRefreshTokenCookie(res, result.refreshToken);
      
      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const result = await authService.login(validatedData);
      
      setRefreshTokenCookie(res, result.refreshToken);
      
      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Get refresh token from cookie or request body (fallback for headers)
      const token = req.cookies?.[COOKIE_NAME] || req.body.refreshToken;
      if (!token) {
        throw new UnauthorizedError('Session expired or refresh token missing.');
      }

      const result = await authService.rotateTokens(token);
      
      setRefreshTokenCookie(res, result.refreshToken);
      
      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.[COOKIE_NAME] || req.body.refreshToken;
      if (token) {
        await authService.logout(token);
      }
      
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Profile access requires login credentials.');
      }
      
      const user = await authService.getProfile(req.user.id);
      
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(email);

      // Always return success to prevent email enumeration
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
