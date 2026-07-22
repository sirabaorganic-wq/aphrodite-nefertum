import axios from 'axios';
import { logger } from '../utils/logger.js';
import { redisConnection } from './redis.js';

const SHIPROCKET_TOKEN_KEY = 'shiprocket:auth_token';
const SHIPROCKET_TOKEN_TTL = 23 * 60 * 60; // 23 hours in seconds

class ShiprocketClient {
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private baseUrl = 'https://apiv2.shiprocket.in/v1/external';

  private isMock(): boolean {
    return (
      !process.env.SHIPROCKET_EMAIL ||
      process.env.SHIPROCKET_EMAIL === 'admin@sirabaorganic.com'
    );
  }

  private async authenticate() {
    if (this.isMock()) {
      logger.info('Shiprocket Client running in MOCK mode.');
      this.token = 'mock_shiprocket_jwt_token';
      this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
      return;
    }

    // Check in-memory cache first
    if (this.token && Date.now() < this.tokenExpiry) {
      return;
    }

    // Try Redis cache
    try {
      if (redisConnection.status === 'ready') {
        const cachedToken = await redisConnection.get(SHIPROCKET_TOKEN_KEY);
        if (cachedToken) {
          this.token = cachedToken;
          this.tokenExpiry = Date.now() + SHIPROCKET_TOKEN_TTL * 1000;
          logger.info('Shiprocket token restored from Redis cache.');
          return;
        }
      }
    } catch (e: any) {
      logger.warn(`Redis lookup for Shiprocket token failed: ${e.message}`);
    }

    // Fetch fresh token from Shiprocket API
    try {
      logger.info('Authenticating with Shiprocket API...');
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        this.tokenExpiry = Date.now() + SHIPROCKET_TOKEN_TTL * 1000;
        logger.info('Shiprocket API authenticated successfully.');

        // Cache in Redis with 23hr TTL
        try {
          if (redisConnection.status === 'ready') {
            await redisConnection.set(SHIPROCKET_TOKEN_KEY, this.token!, 'EX', SHIPROCKET_TOKEN_TTL);
            logger.info('Shiprocket token cached in Redis.');
          }
        } catch (cacheErr: any) {
          logger.warn(`Failed to cache Shiprocket token in Redis: ${cacheErr.message}`);
        }
      }
    } catch (e: any) {
      logger.error(`Shiprocket authentication failed: ${e.message}. Falling back to mock logistics.`);
      this.token = 'mock_shiprocket_jwt_token';
      this.tokenExpiry = Date.now() + 60 * 60 * 1000;
    }
  }

  private async getHeaders() {
    await this.authenticate();
    return { Authorization: `Bearer ${this.token}` };
  }

  public async createShipment(order: any, address: any) {
    const headers = await this.getHeaders();

    if (this.isMock() || this.token === 'mock_shiprocket_jwt_token') {
      logger.info(`[MOCK LOGISTICS] Creating shipment for order ${order.id} in Shiprocket...`);
      return {
        success: true,
        order_id: Math.floor(Math.random() * 10000000),
        shipment_id: Math.floor(Math.random() * 10000000),
        awb_code: `AWB${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        status: 'NEW',
      };
    }

    try {
      const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';
      const payload = {
        order_id: order.id,
        order_date: order.createdAt.toISOString().replace('T', ' ').substring(0, 16),
        pickup_location: pickupLocation,
        comment: 'Aphrodite Nefertum Luxury Fragrance',
        billing_customer_name: order.user?.firstName || 'Fragrance',
        billing_last_name: order.user?.lastName || 'Conqueror',
        billing_address: address.street,
        billing_city: address.city,
        billing_pincode: address.postalCode,
        billing_state: address.state,
        billing_country: address.country || 'India',
        billing_email: order.user?.email || 'customer@example.com',
        billing_phone: order.user?.phone || '9999999999',
        shipping_is_billing: true,
        order_items: order.items.map((item: any) => ({
          name: item.variant?.product?.name || 'Fragrance',
          sku: item.variant?.sku || `SKU-${item.variantId}`,
          units: item.quantity,
          selling_price: item.price,
          discount: 0,
          tax: 0,
          hsn: '',
        })),
        payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
        sub_total: order.subtotal,
        length: 15,
        breadth: 10,
        height: 10,
        weight: 0.5,
      };

      const response = await axios.post(`${this.baseUrl}/orders/create/adhoc`, payload, { headers });

      return {
        success: true,
        order_id: response.data.order_id,
        shipment_id: response.data.shipment_id,
        awb_code: response.data.awb_code || null,
        status: response.data.status,
      };
    } catch (e: any) {
      logger.error(`Shiprocket createShipment failed: ${e.message}`);
      throw new Error(`Shiprocket API failure: ${e.message}`);
    }
  }

  public async generateAwb(shipmentId: number): Promise<string | null> {
    const headers = await this.getHeaders();

    if (this.isMock() || this.token === 'mock_shiprocket_jwt_token') {
      return `AWB${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/courier/assign/awb`,
        { shipment_id: shipmentId },
        { headers }
      );
      return response.data?.response?.data?.awb_code || null;
    } catch (e: any) {
      logger.error(`Shiprocket generateAwb failed for shipment ${shipmentId}: ${e.message}`);
      return null;
    }
  }

  public async generateLabel(shipmentId: number): Promise<string | null> {
    const headers = await this.getHeaders();

    if (this.isMock() || this.token === 'mock_shiprocket_jwt_token') {
      return `https://shiprocket.mock/label/${shipmentId}.pdf`;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/courier/generate/label`,
        { shipment_id: [shipmentId] },
        { headers }
      );
      return response.data?.label_url || null;
    } catch (e: any) {
      logger.error(`Shiprocket generateLabel failed for shipment ${shipmentId}: ${e.message}`);
      return null;
    }
  }

  public async generatePickup(shipmentId: number): Promise<boolean> {
    const headers = await this.getHeaders();

    if (this.isMock() || this.token === 'mock_shiprocket_jwt_token') {
      return true;
    }

    try {
      await axios.post(
        `${this.baseUrl}/courier/generate/pickup`,
        { shipment_id: [shipmentId] },
        { headers }
      );
      return true;
    } catch (e: any) {
      logger.error(`Shiprocket generatePickup failed for shipment ${shipmentId}: ${e.message}`);
      return false;
    }
  }

  public async checkServiceability(pincode: string, weight: number = 0.5) {
    const headers = await this.getHeaders();
    const warehousePincode = process.env.SHIPROCKET_WAREHOUSE_PINCODE || '122018';

    if (this.isMock() || this.token === 'mock_shiprocket_jwt_token') {
      return {
        available: true,
        couriers: [
          { name: 'Delhivery', etd: '3-5 business days', rate: 80 },
          { name: 'BlueDart', etd: '2-4 business days', rate: 120 },
        ],
        estimatedDelivery: '3-5 business days',
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/courier/serviceability/`, {
        params: {
          pickup_postcode: warehousePincode,
          delivery_postcode: pincode,
          weight: weight,
          cod: 0,
        },
        headers,
      });

      const couriers = response.data?.data?.available_courier_companies || [];
      return {
        available: couriers.length > 0,
        couriers: couriers.map((c: any) => ({
          name: c.courier_name,
          etd: c.etd,
          rate: c.rate,
        })),
        estimatedDelivery: couriers.length > 0 ? couriers[0].etd : null,
      };
    } catch (e: any) {
      logger.error(`Shiprocket serviceability check failed: ${e.message}`);
      return {
        available: false,
        couriers: [],
        estimatedDelivery: null,
      };
    }
  }

  public async trackShipment(awb: string) {
    const headers = await this.getHeaders();

    if (this.isMock() || this.token === 'mock_shiprocket_jwt_token') {
      return {
        awb,
        courier: 'Mock Courier',
        currentStatus: 'In Transit',
        estimatedDelivery: '3-5 business days',
        trackingUrl: `https://shiprocket.mock/track/${awb}`,
        statusHistory: [
          { status: 'Order Placed', date: new Date().toISOString(), location: 'Origin' },
          { status: 'Picked Up', date: new Date().toISOString(), location: 'Warehouse' },
        ],
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/courier/track/awb/${awb}`, { headers });
      const data = response.data?.tracking_data || {};
      const shipmentTrack = data.shipment_track || [];
      const trackActivities = data.shipment_track_activities || [];

      return {
        awb,
        courier: shipmentTrack[0]?.courier_name || null,
        currentStatus: data.shipment_status || null,
        estimatedDelivery: data.etd || null,
        trackingUrl: data.track_url || null,
        statusHistory: trackActivities.map((a: any) => ({
          status: a.activity,
          date: a.date,
          location: a.location,
        })),
      };
    } catch (e: any) {
      logger.error(`Shiprocket tracking failed for AWB ${awb}: ${e.message}`);
      return {
        awb,
        courier: null,
        currentStatus: null,
        estimatedDelivery: null,
        trackingUrl: null,
        statusHistory: [],
      };
    }
  }
}

export const shiprocketClient = new ShiprocketClient();
