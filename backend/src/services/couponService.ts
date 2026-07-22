import { couponRepository } from '../repositories/couponRepository.js';
import { NotFoundError, BadRequestError } from '../utils/customError.js';
import { logAuditAction } from '../utils/auditLogger.js';

export class CouponService {
  async validateCoupon(code: string, orderSubtotal: number) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) {
      throw new NotFoundError('Invalid discount coupon code.');
    }

    const now = new Date();

    if (!coupon.isActive) {
      throw new BadRequestError('This coupon is currently inactive.');
    }

    if (coupon.startsAt > now) {
      throw new BadRequestError('This coupon promotion has not started yet.');
    }

    if (coupon.expiresAt < now) {
      throw new BadRequestError('This coupon code has expired.');
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestError('This coupon has reached its maximum usage limit.');
    }

    if (orderSubtotal < coupon.minOrderValue) {
      throw new BadRequestError(`Minimum order value of ₹${coupon.minOrderValue} required to apply this coupon.`);
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (coupon.discountValue / 100) * orderSubtotal;
      if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'FLAT') {
      discountAmount = coupon.discountValue;
    }

    // Avoid negative pricing
    discountAmount = Math.min(discountAmount, orderSubtotal);

    return {
      coupon,
      discountAmount: Math.round(discountAmount * 100) / 100, // round to 2 decimals
    };
  }

  async getAllCoupons() {
    return couponRepository.findAllCoupons();
  }

  async createCoupon(
    actor: { id: string; email: string; role: string },
    data: {
      code: string;
      discountType: 'PERCENTAGE' | 'FLAT';
      discountValue: number;
      minOrderValue?: number;
      maxDiscount?: number;
      startsAt: string;
      expiresAt: string;
      usageLimit?: number;
    }
  ) {
    const existing = await couponRepository.findByCode(data.code);
    if (existing) {
      throw new BadRequestError('A coupon with this code already exists.');
    }

    const coupon = await couponRepository.createCoupon({
      ...data,
      startsAt: new Date(data.startsAt),
      expiresAt: new Date(data.expiresAt),
    });

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'COUPON_CREATE',
      entityType: 'Coupon',
      entityId: coupon.id,
      metadata: { code: coupon.code },
    });

    return coupon;
  }

  async updateCoupon(
    id: string,
    actor: { id: string; email: string; role: string },
    data: any
  ) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw new NotFoundError('Coupon not found.');
    }

    const updateData = { ...data };
    if (data.startsAt) updateData.startsAt = new Date(data.startsAt);
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);

    const updated = await couponRepository.updateCoupon(id, updateData);

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'COUPON_UPDATE',
      entityType: 'Coupon',
      entityId: id,
      metadata: data,
    });

    return updated;
  }

  async deleteCoupon(id: string, actor: { id: string; email: string; role: string }) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw new NotFoundError('Coupon not found.');
    }

    await couponRepository.deleteCoupon(id);

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'COUPON_DELETE',
      entityType: 'Coupon',
      entityId: id,
      metadata: { code: coupon.code },
    });
  }
}

export const couponService = new CouponService();
