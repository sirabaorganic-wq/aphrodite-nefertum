import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { emailService } from '../services/emailService.js';
import { logger } from '../utils/logger.js';
import { BadRequestError } from '../utils/customError.js';

const router = Router();

const reviewSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(10, 'Review must be at least 10 characters').max(2000),
});

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Submit a customer review
 *     tags: [Reviews]
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = reviewSchema.parse(req.body);

    // Send the review to the business email
    await emailService.sendReviewNotification(data);

    logger.info(`New review submitted by ${data.email} (Rating: ${data.rating}/5)`);

    res.status(200).json({
      success: true,
      message: 'Thank you for your review! Your feedback has been received.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors.map(e => e.message).join(', ')));
    }
    next(error);
  }
});

export default router;
