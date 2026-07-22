import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { authRepository } from '../repositories/authRepository.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/customError.js';
import { logAuditAction } from '../utils/auditLogger.js';
import { addJobToQueue, emailQueue } from '../config/bullQueue.js';

export class AuthService {
  private getAccessSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('FATAL: JWT_SECRET environment variable is not set.');
    }
    return secret;
  }

  private getRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('FATAL: JWT_REFRESH_SECRET environment variable is not set.');
    }
    return secret;
  }

  public generateAccessToken(user: { id: string; email: string; role: 'ADMIN' | 'CONSUMER' }): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.getAccessSecret(),
      { expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any }
    );
  }

  public generateRefreshToken(user: { id: string; email: string; role: 'ADMIN' | 'CONSUMER' }): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.getRefreshSecret(),
      { expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any }
    );
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) {
      throw new ConflictError('A user account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await authRepository.createUser({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });

    // Write Audit Log
    await logAuditAction({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: user.id,
      metadata: { email: user.email },
    });

    // Add welcome email to BullMQ background job queue
    await addJobToQueue(emailQueue, 'sendWelcome', {
      email: user.email,
      payload: { name: user.firstName },
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days matching token lifespan
    await authRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: { email: string; password: any }) {
    const user = await authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email address or password.');
    }

    const match = await bcrypt.compare(data.password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedError('Invalid email address or password.');
    }

    // Write Audit Log
    await logAuditAction({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async rotateTokens(token: string) {
    if (!token) {
      throw new UnauthorizedError('Refresh token is missing.');
    }

    const savedToken = await authRepository.findRefreshToken(token);
    if (!savedToken) {
      throw new UnauthorizedError('Invalid or expired session.');
    }

    if (savedToken.revoked || savedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Session has expired or been revoked.');
    }

    // Token is valid. Generate new tokens (Refresh Token Rotation)
    const user = savedToken.user;
    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    // Invalidate the old refresh token
    await authRepository.revokeRefreshToken(token);

    // Save the new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.createRefreshToken(user.id, newRefreshToken, expiresAt);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(token: string) {
    if (!token) return;
    
    try {
      const savedToken = await authRepository.findRefreshToken(token);
      if (savedToken) {
        await authRepository.revokeRefreshToken(token);
        
        await logAuditAction({
          actorId: savedToken.userId,
          actorEmail: savedToken.user.email,
          actorRole: savedToken.user.role,
          action: 'USER_LOGOUT',
          entityType: 'User',
          entityId: savedToken.userId,
        });
      }
    } catch (e) {
      // Fail silently for robustness
    }
  }

  async getProfile(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new BadRequestError('User profile does not exist.');
    }
    return user;
  }

  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Return silently to prevent email enumeration
      return;
    }

    // Generate a random token and hash it for storage
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await authRepository.createPasswordResetToken(user.id, hashedToken, expiresAt);

    // Dispatch password reset email via BullMQ
    await addJobToQueue(emailQueue, 'sendPasswordReset', {
      email: user.email,
      payload: { token: rawToken },
    });

    await logAuditAction({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'PASSWORD_RESET_REQUEST',
      entityType: 'User',
      entityId: user.id,
    });
  }

  async resetPassword(token: string, newPassword: string) {
    // Hash the incoming token to match stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await authRepository.findPasswordResetToken(hashedToken);
    if (!resetToken) {
      throw new BadRequestError('Invalid or expired password reset token.');
    }

    if (resetToken.used) {
      throw new BadRequestError('This password reset token has already been used.');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestError('Password reset token has expired. Please request a new one.');
    }

    // Hash and update the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await authRepository.updateUserPassword(resetToken.userId, passwordHash);
    await authRepository.markPasswordResetTokenUsed(resetToken.id);

    await logAuditAction({
      actorId: resetToken.userId,
      actorEmail: resetToken.user.email,
      actorRole: resetToken.user.role,
      action: 'PASSWORD_RESET_COMPLETE',
      entityType: 'User',
      entityId: resetToken.userId,
    });
  }
}

export const authService = new AuthService();
