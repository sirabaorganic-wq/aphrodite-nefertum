import { prisma } from '../config/db.js';
import { CouponDiscountType } from '@prisma/client';

export class CouponRepository {
  async findByCode(code: string) {
    return prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  async findById(id: string) {
    return prisma.coupon.findUnique({
      where: { id },
    });
  }

  async findAllCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCoupon(data: {
    code: string;
    discountType: 'PERCENTAGE' | 'FLAT';
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    startsAt: Date;
    expiresAt: Date;
    usageLimit?: number;
  }) {
    return prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType as CouponDiscountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue || 0,
        maxDiscount: data.maxDiscount || null,
        startsAt: data.startsAt,
        expiresAt: data.expiresAt,
        usageLimit: data.usageLimit || null,
      },
    });
  }

  async updateCoupon(id: string, data: any) {
    if (data.code) {
      data.code = data.code.toUpperCase();
    }
    if (data.discountType) {
      data.discountType = data.discountType as CouponDiscountType;
    }
    return prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async incrementUsage(id: string) {
    return prisma.coupon.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
      },
    });
  }

  async deleteCoupon(id: string) {
    return prisma.coupon.delete({
      where: { id },
    });
  }
}

export const couponRepository = new CouponRepository();
