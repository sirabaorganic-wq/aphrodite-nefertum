import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService.js';

export class AnalyticsController {
  async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await analyticsService.getDashboardMetrics();
      res.status(200).json({ success: true, metrics });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlySales(req: Request, res: Response, next: NextFunction) {
    try {
      const monthlySales = await analyticsService.getMonthlySales();
      res.status(200).json({ success: true, monthlySales });
    } catch (error) {
      next(error);
    }
  }

  async getTopSellingProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topProducts = await analyticsService.getTopSellingProducts(limit);
      res.status(200).json({ success: true, topProducts });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerGrowth(req: Request, res: Response, next: NextFunction) {
    try {
      const growth = await analyticsService.getCustomerGrowth();
      res.status(200).json({ success: true, customerGrowth: growth });
    } catch (error) {
      next(error);
    }
  }

  async getCouponAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await analyticsService.getCouponAnalytics();
      res.status(200).json({ success: true, couponAnalytics: analytics });
    } catch (error) {
      next(error);
    }
  }

  async getLowStockAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const threshold = parseInt(req.query.threshold as string) || 10;
      const alerts = await analyticsService.getLowStockAlerts(threshold);
      res.status(200).json({ success: true, lowStockAlerts: alerts });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await analyticsService.getAuditLogs(page, limit);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
