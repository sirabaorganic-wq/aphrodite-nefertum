import Razorpay from 'razorpay';
import { logger } from '../utils/logger.js';

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId123';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'mockKeySecret45678';

export const isRazorpayMock = keyId.startsWith('rzp_test_mock');

let razorpayClient: Razorpay | null = null;

try {
  razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  logger.info(`Razorpay client initialized. Mode: ${isRazorpayMock ? 'MOCK' : 'LIVE/TEST CREDENTIALS'}`);
} catch (e: any) {
  logger.warn(`Razorpay client initialization failed: ${e.message}. Running in fallback mock payment mode.`);
}

export { razorpayClient };
