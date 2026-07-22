import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authRateLimiter } from '../middlewares/security.js';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new consumer user
 *     tags: [Auth]
 */
router.post('/register', authRateLimiter, authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Auth]
 */
router.post('/login', authRateLimiter, authController.login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh tokens
 *     tags: [Auth]
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out of the current session
 *     tags: [Auth]
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get profile of authenticated user
 *     tags: [Auth]
 */
router.get('/profile', protect, authController.getProfile);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 */
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password with a valid token
 *     tags: [Auth]
 */
router.post('/reset-password', authRateLimiter, authController.resetPassword);

export default router;
