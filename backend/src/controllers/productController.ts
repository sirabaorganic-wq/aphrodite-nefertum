import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/productService.js';
import {
  productQuerySchema,
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
} from '../validators/productValidator.js';
import { UnauthorizedError } from '../utils/customError.js';

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      const queryFilters = productQuerySchema.parse(req.query);
      
      const results = await productService.getProducts({
        ...queryFilters,
        includeDrafts: isAdmin,
      });

      res.status(200).json({
        success: true,
        ...results,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      const { id } = req.params;
      const product = await productService.getProductById(id, isAdmin);
      
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      const { slug } = req.params;
      const product = await productService.getProductBySlug(slug, isAdmin);
      
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validatedBody = createProductSchema.parse(req.body);
      
      const product = await productService.createProduct(req.user, validatedBody);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const validatedBody = updateProductSchema.parse(req.body);
      
      const product = await productService.updateProduct(id, req.user, validatedBody);
      
      res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      await productService.deleteProduct(id, req.user);
      
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  async addVariant(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { productId } = req.params;
      const validatedBody = createVariantSchema.parse(req.body);
      
      const variant = await productService.addVariant(productId, req.user, validatedBody);
      
      res.status(201).json({
        success: true,
        message: 'Product variant created successfully.',
        variant,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateVariant(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { variantId } = req.params;
      const validatedBody = updateVariantSchema.parse(req.body);
      
      const variant = await productService.updateVariant(variantId, req.user, validatedBody);
      
      res.status(200).json({
        success: true,
        message: 'Product variant updated successfully.',
        variant,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVariant(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { variantId } = req.params;
      await productService.deleteVariant(variantId, req.user);
      
      res.status(200).json({
        success: true,
        message: 'Product variant deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.uploadProductImage(req.file as Express.Multer.File);
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully.',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
