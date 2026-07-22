import { addressRepository } from '../repositories/addressRepository.js';
import { NotFoundError, ForbiddenError } from '../utils/customError.js';

export class AddressService {
  async getAddresses(userId: string) {
    return addressRepository.findAddressesByUserId(userId);
  }

  async getAddressById(id: string, userId: string) {
    const address = await addressRepository.findAddressById(id);
    if (!address) {
      throw new NotFoundError('Saved address not found.');
    }
    if (address.userId !== userId) {
      throw new ForbiddenError('Access denied. You do not own this address.');
    }
    return address;
  }

  async createAddress(userId: string, data: any) {
    return addressRepository.createAddress(userId, data);
  }

  async updateAddress(id: string, userId: string, data: any) {
    await this.getAddressById(id, userId); // ownership check
    return addressRepository.updateAddress(id, userId, data);
  }

  async deleteAddress(id: string, userId: string) {
    await this.getAddressById(id, userId); // ownership check
    await addressRepository.deleteAddress(id);
  }
}

export const addressService = new AddressService();
