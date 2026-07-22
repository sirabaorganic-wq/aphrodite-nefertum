import { Router } from 'express';
import { addressController } from '../controllers/addressController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/addresses:
 *   get:
 *     summary: Retrieve saved addresses of current user
 *     tags: [Addresses]
 */
router.get('/', protect, addressController.getAddresses);

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   get:
 *     summary: Get a single saved address by ID
 *     tags: [Addresses]
 */
router.get('/:id', protect, addressController.getAddressById);

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Add a new saved address
 *     tags: [Addresses]
 */
router.post('/', protect, addressController.createAddress);

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   put:
 *     summary: Update an existing saved address
 *     tags: [Addresses]
 */
router.put('/:id', protect, addressController.updateAddress);

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   delete:
 *     summary: Delete a saved address
 *     tags: [Addresses]
 */
router.delete('/:id', protect, addressController.deleteAddress);

export default router;
