import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

import { swaggerSpec } from './config/swagger.js';
import { requestTracing } from './middlewares/requestTracing.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import {
  helmetMiddleware,
  corsMiddleware,
  apiRateLimiter,
  xssSanitizer,
} from './middlewares/security.js';
import { logger } from './utils/logger.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import shiprocketRoutes from './routes/shiprocketRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Global Middleware Stack ───────────────────────────────────────────────────
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.options('*', corsMiddleware); // Pre-flight CORS

app.use(requestTracing);           // Attach correlation IDs

// Parse raw body BEFORE JSON for Razorpay webhook signature verification
app.use('/api/v1/orders/webhook', express.raw({ type: 'application/json' }));
app.use('/api/v1/logistics/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(xssSanitizer);
app.use(apiRateLimiter);

// ─── HTTP Request Logger ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http({
      message: `${req.method} ${req.originalUrl} ${res.statusCode} — ${duration}ms`,
      correlationId: req.correlationId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
    });
  });
  next();
});

// ─── Static File Serving (local uploads fallback) ─────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// ─── Swagger Documentation ────────────────────────────────────────────────────
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { background-color: #050505; }
      .swagger-ui .topbar-wrapper .link { display: none; }
      .swagger-ui .info h2 { color: #C6A972; }
    `,
    customSiteTitle: 'Aphrodite Nefertum API Docs',
  })
);

// Serve raw spec as JSON for external tooling
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── Health & Readiness Endpoints ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'aphrodite-nefertum-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/ready', async (req, res) => {
  try {
    const { prisma } = await import('./config/db.js');
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (e: any) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected', error: e.message });
  }
});

// ─── API v1 Routes ────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`,      authRoutes);
app.use(`${API_PREFIX}/products`,  productRoutes);
app.use(`${API_PREFIX}/cart`,      cartRoutes);
app.use(`${API_PREFIX}/addresses`, addressRoutes);
app.use(`${API_PREFIX}/wishlist`,  wishlistRoutes);
app.use(`${API_PREFIX}/coupons`,   couponRoutes);
app.use(`${API_PREFIX}/orders`,    orderRoutes);
app.use(`${API_PREFIX}/logistics`, shiprocketRoutes);
app.use(`${API_PREFIX}/shipping`,  shippingRoutes);
app.use(`${API_PREFIX}/cms`,       cmsRoutes);
app.use(`${API_PREFIX}/admin`,     adminRoutes);
app.use(`${API_PREFIX}/reviews`,   reviewRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
    hint: 'Visit /api-docs to see all available endpoints.',
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorMiddleware);

export default app;
