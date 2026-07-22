import { Request, Response, NextFunction } from 'express';
import { cmsService } from '../services/cmsService.js';
import { createCmsSchema, updateCmsSchema } from '../validators/cmsValidator.js';
import { UnauthorizedError } from '../utils/customError.js';

export class CmsController {
  async getContentByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const isAdmin = req.user?.role === 'ADMIN';
      const content = await cmsService.getContentByType(type.toUpperCase(), isAdmin);

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error) {
      next(error);
    }
  }

  async getContentBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const isAdmin = req.user?.role === 'ADMIN';
      const content = await cmsService.getContentBySlug(slug, isAdmin);

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error) {
      next(error);
    }
  }

  async createContent(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validatedBody = createCmsSchema.parse(req.body);

      const content = await cmsService.createContent(req.user, validatedBody);

      res.status(201).json({
        success: true,
        message: 'CMS content created successfully.',
        content,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateContent(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const validatedBody = updateCmsSchema.parse(req.body);

      const content = await cmsService.updateContent(id, req.user, validatedBody);

      res.status(200).json({
        success: true,
        message: 'CMS content updated successfully.',
        content,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteContent(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      await cmsService.deleteContent(id, req.user);

      res.status(200).json({
        success: true,
        message: 'CMS content deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const cmsController = new CmsController();
