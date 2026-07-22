import { Request, Response, NextFunction } from 'express';
import { addressService } from '../services/addressService.js';
import { createAddressSchema, updateAddressSchema } from '../validators/addressValidator.js';
import { UnauthorizedError } from '../utils/customError.js';

export class AddressController {
  async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const addresses = await addressService.getAddresses(req.user.id);
      
      res.status(200).json({
        success: true,
        addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAddressById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const address = await addressService.getAddressById(id, req.user.id);
      
      res.status(200).json({
        success: true,
        address,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validatedBody = createAddressSchema.parse(req.body);
      
      const address = await addressService.createAddress(req.user.id, validatedBody);
      
      res.status(201).json({
        success: true,
        message: 'Address saved successfully.',
        address,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const validatedBody = updateAddressSchema.parse(req.body);
      
      const address = await addressService.updateAddress(id, req.user.id, validatedBody);
      
      res.status(200).json({
        success: true,
        message: 'Address updated successfully.',
        address,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      await addressService.deleteAddress(id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Address deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const addressController = new AddressController();
