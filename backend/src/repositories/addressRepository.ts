import { prisma } from '../config/db.js';

export class AddressRepository {
  async findAddressesByUserId(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async findAddressById(id: string) {
    return prisma.address.findUnique({
      where: { id },
    });
  }

  async clearDefaults(userId: string) {
    return prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  async createAddress(userId: string, data: {
    label: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }) {
    if (data.isDefault) {
      await this.clearDefaults(userId);
    }
    return prisma.address.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async updateAddress(id: string, userId: string, data: any) {
    if (data.isDefault) {
      await this.clearDefaults(userId);
    }
    return prisma.address.update({
      where: { id },
      data,
    });
  }

  async deleteAddress(id: string) {
    return prisma.address.delete({
      where: { id },
    });
  }
}

export const addressRepository = new AddressRepository();
