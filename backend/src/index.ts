import 'dotenv/config';

// ── Fail-fast: Verify critical JWT env vars before loading any modules ───────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Server cannot start.');
  process.exit(1);
}
if (!process.env.JWT_REFRESH_SECRET) {
  console.error('FATAL: JWT_REFRESH_SECRET environment variable is not set. Server cannot start.');
  process.exit(1);
}

// ── Razorpay credentials check ──────────────────────────────────────────────
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('FATAL: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set.');
  process.exit(1);
}

// ── Shiprocket credentials check ────────────────────────────────────────────
if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
  console.error('FATAL: SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be set.');
  process.exit(1);
}

import http from 'http';
import app from './app.js';
import { prisma } from './config/db.js';
import { logger } from './utils/logger.js';
import { initQueueWorkers } from './config/bullQueue.js';
import { orderService } from './services/orderService.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function bootstrap() {
  try {
    // ── 1. Verify PostgreSQL Connection ────────────────────────────────────────
    await prisma.$connect();
    logger.info('✅ PostgreSQL database connected successfully.');

    // ── 2. Start Background Queue Workers (BullMQ) ────────────────────────────
    initQueueWorkers();
    logger.info('✅ BullMQ background workers initialised.');

    // ── 3. Schedule expired stock-reservation cleanup every 5 minutes ─────────
    const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 min
    setInterval(async () => {
      try {
        await orderService.releaseExpiredReservations();
      } catch (e: any) {
        logger.warn(`Stock reservation cleanup cycle error: ${e.message}`);
      }
    }, CLEANUP_INTERVAL_MS);
    logger.info('✅ Stock reservation cleanup daemon scheduled (every 5 min).');

    // ── 4. Start HTTP Server ──────────────────────────────────────────────────
    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`\n╔════════════════════════════════════════╗`);
      logger.info(`║   APHRODITE NEFERTUM API SERVER        ║`);
      logger.info(`║   http://localhost:${PORT}               ║`);
      logger.info(`║   API Docs: /api-docs                  ║`);
      logger.info(`║   Health:   /health                    ║`);
      logger.info(`║   Env: ${process.env.NODE_ENV || 'development'}                     ║`);
      logger.info(`╚════════════════════════════════════════╝\n`);
    });

    // ── 5. Graceful Shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Gracefully shutting down...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database disconnected. Server closed. Goodbye.');
        process.exit(0);
      });
      // Force exit if graceful shutdown takes too long
      setTimeout(() => process.exit(1), 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    // Unhandled rejections / uncaught exceptions safety net
    process.on('unhandledRejection', (reason) => {
      logger.error(`Unhandled Promise Rejection: ${reason}`);
    });
    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
      process.exit(1);
    });

  } catch (error: any) {
    logger.error(`Server bootstrap failed: ${error.message}`);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

bootstrap();
