import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from './redis.js';
import { logger } from '../utils/logger.js';
import { emailService } from '../services/emailService.js';

// Define queues
export const emailQueue = new Queue('emailQueue', { connection: redisConnection as any });
export const shipmentQueue = new Queue('shipmentQueue', { connection: redisConnection as any });
export const analyticsQueue = new Queue('analyticsQueue', { connection: redisConnection as any });

// Start Worker functions
export function initQueueWorkers() {
  logger.info('Initializing background queue workers...');

  // 1. Email Worker
  const emailWorker = new Worker(
    'emailQueue',
    async (job: Job) => {
      logger.info(`Processing email job: ${job.name} (ID: ${job.id})`);
      const { email, subject, payload } = job.data;
      
      switch (job.name) {
        case 'sendWelcome':
          await emailService.sendWelcomeEmail(email, payload.name);
          break;
        case 'sendOrderConfirmation':
          await emailService.sendOrderConfirmationEmail(email, payload.order);
          break;
        case 'sendShipmentUpdate':
          await emailService.sendShipmentUpdateEmail(email, payload.order, payload.status, payload.awb);
          break;
        case 'sendPasswordReset':
          await emailService.sendPasswordResetEmail(email, payload.token);
          break;
        default:
          logger.warn(`Unknown email job type: ${job.name}`);
      }
    },
    { connection: redisConnection as any }
  );

  emailWorker.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed successfully.`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error(`Email job ${job?.id} failed with error: ${err.message}`);
  });

  // 2. Shipment Worker
  const shipmentWorker = new Worker(
    'shipmentQueue',
    async (job: Job) => {
      logger.info(`Processing shipment job: ${job.name}`);
      if (job.name === 'createShipment') {
        const { orderId } = job.data;
        const { shiprocketService } = await import('../services/shiprocketService.js');
        await shiprocketService.processShipmentCreation(orderId);
      }
    },
    { connection: redisConnection as any }
  );

  // 3. Analytics Worker
  const analyticsWorker = new Worker(
    'analyticsQueue',
    async (job: Job) => {
      logger.info(`Processing background analytics compilation: ${job.name}`);
      // Background aggregation processes
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    { connection: redisConnection as any }
  );
}

// Utility wrapper to dispatch jobs with Redis safety check
export async function addJobToQueue(queue: Queue, name: string, data: any) {
  try {
    if (redisConnection.status === 'ready') {
      await queue.add(name, data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
      logger.debug(`Job ${name} pushed to ${queue.name} queue`);
    } else {
      // Redis is not connected, execute immediately (degraded inline execution) for development
      logger.warn(`Redis is offline. Executing job inline immediately: ${name}`);
      executeJobInline(queue.name, name, data);
    }
  } catch (error: any) {
    logger.error(`Error adding job to queue ${queue.name}: ${error.message}`);
    // Fallback inline execution
    executeJobInline(queue.name, name, data);
  }
}

// Inline fallback execution when Redis is offline (essential for local dev without redis running)
async function executeJobInline(queueName: string, name: string, data: any) {
  try {
    if (queueName === 'emailQueue') {
      const { email, payload } = data;
      switch (name) {
        case 'sendWelcome':
          await emailService.sendWelcomeEmail(email, payload.name);
          break;
        case 'sendOrderConfirmation':
          await emailService.sendOrderConfirmationEmail(email, payload.order);
          break;
        case 'sendShipmentUpdate':
          await emailService.sendShipmentUpdateEmail(email, payload.order, payload.status, payload.awb);
          break;
        case 'sendPasswordReset':
          await emailService.sendPasswordResetEmail(email, payload.token);
          break;
      }
    }
  } catch (e: any) {
    logger.error(`Fallback inline job execution failed for ${name}: ${e.message}`);
  }
}
