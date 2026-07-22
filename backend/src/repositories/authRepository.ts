import { prisma } from '../config/db.js';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'CONSUMER', // default signup
      },
    });
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async revokeRefreshToken(token: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }

  async deleteExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true },
        ],
      },
    });
  }

  async createPasswordResetToken(userId: string, hashedToken: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });
  }

  async findPasswordResetToken(hashedToken: string) {
    return prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });
  }

  async markPasswordResetTokenUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { used: true },
    });
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}

export const authRepository = new AuthRepository();
