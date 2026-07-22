import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { logger } from './logger.js';

// Setup local uploads directory
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloud';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info('Cloudinary configured successfully for media uploads.');
} else {
  logger.warn('Cloudinary not configured (mock details detected). File uploads will default to local workspace at /public/uploads/.');
}

// Multer Local Disk Storage configuration
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed.'));
  },
});

// Helper function to upload file to Cloudinary, fallback to local path
export async function uploadToStorage(file: Express.Multer.File): Promise<string> {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'aphrodite_nefertum_products',
      });
      // Delete temporary local file created by multer
      fs.unlinkSync(file.path);
      return result.secure_url;
    } catch (e: any) {
      logger.error(`Cloudinary upload failed: ${e.message}. Falling back to local file link.`);
    }
  }

  // Fallback to local server path
  const relativePath = `/uploads/${path.basename(file.path)}`;
  return relativePath;
}
