import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const isMock = process.env.SMTP_USER === 'mock_smtp_user';
    if (isMock) {
      logger.info('SMTP configured to use MOCK mode. Emails will print to console logs.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.SMTP_PORT || '2525', 10),
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      });
      
      this.transporter.verify((error) => {
        if (error) {
          logger.warn(`SMTP transport verification failed: ${error.message}. Running in fallback console print mode.`);
          this.transporter = null;
        } else {
          logger.info('SMTP connection established and verified successfully.');
        }
      });
    } catch (e: any) {
      logger.warn(`SMTP init error: ${e.message}. Running in fallback console print mode.`);
    }
  }

  private async sendMail(options: { to: string; subject: string; html: string }) {
    const from = process.env.SMTP_FROM || 'Aphrodite Nefertum <noreply@aphroditenefertum.com>';
    if (!this.transporter) {
      logger.info(`[MOCK EMAIL DISPATCH]
To: ${options.to}
From: ${from}
Subject: ${options.subject}
HTML:
${options.html}
===================================================`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      logger.info(`Email sent successfully to ${options.to} (Subject: ${options.subject})`);
    } catch (e: any) {
      logger.error(`Error sending email to ${options.to}: ${e.message}`);
    }
  }

  public async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <div style="background-color: #050505; color: #F5E7C8; padding: 40px; font-family: sans-serif; text-align: center; border: 1px solid #2A2520;">
        <h1 style="color: #C6A972; font-family: serif; font-size: 32px; margin-bottom: 20px; letter-spacing: 2px;">APHRODITE NEFERTUM</h1>
        <p style="font-size: 16px; font-weight: 300; line-height: 1.6; max-width: 500px; margin: 0 auto 30px auto; color: #A89968;">
          Welcome to the circle of elite fragrance conquerors, <strong>${name}</strong>.
        </p>
        <p style="font-size: 14px; font-weight: 300; max-width: 500px; margin: 0 auto 30px auto; color: #6B5F4A;">
          Formulated for high performance, engineered to last. Experience luxury without boundaries.
        </p>
        <a href="http://localhost:3000/collection" style="background-color: #C6A972; color: #050505; text-decoration: none; padding: 12px 30px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
          Explore Collections
        </a>
      </div>
    `;
    await this.sendMail({
      to: email,
      subject: 'Welcome to APHRODITE NEFERTUM - Sacred Luxury',
      html,
    });
  }

  public async sendOrderConfirmationEmail(email: string, order: any) {
    const itemsList = order.items.map((item: any) => `
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #2A2520; padding: 10px 0;">
        <span style="color: #F5E7C8;">${item.name} (${item.size}) x ${item.quantity}</span>
        <span style="color: #C6A972;">₹${item.price}</span>
      </div>
    `).join('');

    const html = `
      <div style="background-color: #050505; color: #F5E7C8; padding: 40px; font-family: sans-serif; border: 1px solid #2A2520; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C6A972; font-family: serif; font-size: 28px; text-align: center; margin-bottom: 25px; letter-spacing: 2px;">ORDER CONFIRMED</h1>
        <p style="font-size: 15px; color: #A89968; text-align: center; margin-bottom: 30px;">
          Thank you for your purchase. Your order <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> has been recorded and is being prepared.
        </p>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #C6A972; border-bottom: 1px solid #2A2520; padding-bottom: 8px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Items Ordered</h3>
          ${itemsList}
        </div>

        <div style="margin-bottom: 30px; text-align: right; font-size: 16px;">
          <p style="margin: 5px 0; color: #6B5F4A;">Subtotal: <span style="color: #F5E7C8;">₹${order.subtotal}</span></p>
          ${order.discountAmount > 0 ? `<p style="margin: 5px 0; color: #6B5F4A;">Discount: <span style="color: #FF6B6B;">-₹${order.discountAmount}</span></p>` : ''}
          <p style="margin: 5px 0; color: #6B5F4A;">Shipping: <span style="color: #F5E7C8;">₹${order.shippingFee}</span></p>
          <p style="margin: 10px 0 0 0; font-weight: bold; color: #C6A972; font-size: 18px;">Total: ₹${order.totalAmount}</p>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <p style="color: #6B5F4A; font-size: 12px; margin-bottom: 0;">If you have any questions, reply to this email.</p>
        </div>
      </div>
    `;
    await this.sendMail({
      to: email,
      subject: `Order Confirmation #${order.id.slice(0, 8).toUpperCase()} - APHRODITE NEFERTUM`,
      html,
    });
  }

  public async sendShipmentUpdateEmail(email: string, order: any, status: string, awb: string | null) {
    const html = `
      <div style="background-color: #050505; color: #F5E7C8; padding: 40px; font-family: sans-serif; border: 1px solid #2A2520; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C6A972; font-family: serif; font-size: 28px; text-align: center; margin-bottom: 25px; letter-spacing: 2px;">SHIPMENT UPDATE</h1>
        <p style="font-size: 15px; color: #A89968; text-align: center; margin-bottom: 30px;">
          Your order <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> has updated status: <strong style="color: #4CAF50; text-transform: uppercase;">${status}</strong>.
        </p>
        
        ${awb ? `
          <div style="background-color: #100f0d; border: 1px dashed #C6A972; padding: 15px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0 0 5px 0; font-size: 13px; color: #6B5F4A;">SHIPROCKET WAYBILL (AWB)</p>
            <p style="margin: 0; font-size: 18px; font-family: monospace; color: #C6A972; font-weight: bold;">${awb}</p>
          </div>
        ` : ''}

        <p style="font-size: 14px; text-align: center; color: #6B5F4A;">
          We are tracking this package and will ensure it reaches you promptly. Thank you for choosing Aphrodite Nefertum.
        </p>
      </div>
    `;
    await this.sendMail({
      to: email,
      subject: `Shipment Update for Order #${order.id.slice(0, 8).toUpperCase()}`,
      html,
    });
  }

  public async sendPasswordResetEmail(email: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : '');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const html = `
      <div style="background-color: #050505; color: #F5E7C8; padding: 40px; font-family: sans-serif; text-align: center; border: 1px solid #2A2520;">
        <h1 style="color: #C6A972; font-family: serif; font-size: 30px; margin-bottom: 25px;">RESET PASSWORD</h1>
        <p style="font-size: 15px; color: #A89968; max-width: 450px; margin: 0 auto 30px auto; line-height: 1.6;">
          You requested a password reset for your Aphrodite Nefertum account. Click the link below to set a new password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="background-color: #C6A972; color: #050505; text-decoration: none; padding: 12px 30px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 30px;">
          Reset My Password
        </a>
        <p style="color: #6B5F4A; font-size: 12px; margin-bottom: 0;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `;
    await this.sendMail({
      to: email,
      subject: 'Reset Password Request - APHRODITE NEFERTUM',
      html,
    });
  }
  public async sendReviewNotification(data: { name: string; email: string; rating: number; message: string }) {
    const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
    const html = `
      <div style="background-color: #050505; color: #F5E7C8; padding: 40px; font-family: sans-serif; border: 1px solid #2A2520; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C6A972; font-family: serif; font-size: 28px; text-align: center; margin-bottom: 25px; letter-spacing: 2px;">NEW CUSTOMER REVIEW</h1>
        
        <div style="background-color: #100f0d; border: 1px solid #2A2520; padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B5F4A;">From:</p>
          <p style="margin: 0 0 5px 0; font-size: 16px; color: #F5E7C8; font-weight: bold;">${data.name}</p>
          <p style="margin: 0 0 15px 0; font-size: 14px; color: #A89968;">${data.email}</p>
          
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B5F4A;">Rating:</p>
          <p style="margin: 0 0 15px 0; font-size: 24px; color: #C6A972;">${stars}</p>
          
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B5F4A;">Review:</p>
          <p style="margin: 0; font-size: 15px; color: #F5E7C8; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
        </div>
        
        <p style="font-size: 12px; text-align: center; color: #6B5F4A; margin: 0;">
          Submitted on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </p>
      </div>
    `;
    await this.sendMail({
      to: 'aphroditenefertum@gmail.com',
      subject: `⭐ New Review (${data.rating}/5) from ${data.name} - APHRODITE NEFERTUM`,
      html,
    });
  }
}

export const emailService = new EmailService();
