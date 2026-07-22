import { productRepository, ProductFilters } from '../repositories/productRepository.js';
import { redisConnection } from '../config/redis.js';
import { uploadToStorage } from '../utils/storage.js';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/customError.js';
import { logAuditAction } from '../utils/auditLogger.js';
import { logger } from '../utils/logger.js';

export class ProductService {
  private async clearProductCache() {
    try {
      if (redisConnection.status === 'ready') {
        const catalogKeys = await redisConnection.keys('products:*');
        const singleKeys = await redisConnection.keys('product:*');
        const allKeys = [...catalogKeys, ...singleKeys];
        if (allKeys.length > 0) {
          await redisConnection.del(...allKeys);
          logger.debug(`Redis product cache invalidated (${allKeys.length} keys cleared).`);
        }
      }
    } catch (e: any) {
      logger.warn(`Failed to clear product cache: ${e.message}`);
    }
  }

  async getProducts(filters: ProductFilters) {
    const cacheKey = `products:${JSON.stringify(filters)}`;
    
    // Attempt cache read
    try {
      if (redisConnection.status === 'ready') {
        const cached = await redisConnection.get(cacheKey);
        if (cached) {
          logger.debug(`Cache HIT for key: ${cacheKey}`);
          return JSON.parse(cached);
        }
      }
    } catch (e: any) {
      logger.warn(`Redis product cache read error: ${e.message}`);
    }

    // Cache miss
    const results = await productRepository.findProducts(filters);

    // Save to cache for 10 minutes (600 seconds)
    try {
      if (redisConnection.status === 'ready') {
        await redisConnection.setex(cacheKey, 600, JSON.stringify(results));
        logger.debug(`Cache MISS. Saved product results to key: ${cacheKey}`);
      }
    } catch (e: any) {
      logger.warn(`Redis product cache write error: ${e.message}`);
    }

    return results;
  }

  async getProductById(id: string, includeDrafts: boolean = false) {
    const product = await productRepository.findProductById(id, includeDrafts);
    if (!product) {
      throw new NotFoundError('Fragrance product not found.');
    }
    return product;
  }

  async getProductBySlug(slug: string, includeDrafts: boolean = false) {
    const product = await productRepository.findProductBySlug(slug, includeDrafts);
    if (!product) {
      throw new NotFoundError('Fragrance product not found.');
    }
    return product;
  }

  async createProduct(
    actor: { id: string; email: string; role: string },
    data: {
      name: string;
      collection: 'nefertum' | 'aphrodite';
      description: string;
      intensity: number;
      sillage: string;
      longevity: string;
      projection: string;
      status?: 'DRAFT' | 'PUBLISHED';
    }
  ) {
    const duplicate = await productRepository.findProductByName(data.name);
    if (duplicate) {
      throw new ConflictError('A fragrance product with this name already exists.');
    }

    const product = await productRepository.createProduct(data);

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'PRODUCT_CREATE',
      entityType: 'Product',
      entityId: product.id,
      metadata: { name: product.name },
    });

    await this.clearProductCache();
    return product;
  }

  async updateProduct(
    id: string,
    actor: { id: string; email: string; role: string },
    data: any
  ) {
    // Check if exists
    await this.getProductById(id, true);

    if (data.name) {
      const duplicate = await productRepository.findProductByName(data.name);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError('Another fragrance product already uses this name.');
      }
    }

    const product = await productRepository.updateProduct(id, data);

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'PRODUCT_UPDATE',
      entityType: 'Product',
      entityId: product.id,
      metadata: data,
    });

    await this.clearProductCache();
    return product;
  }

  async deleteProduct(id: string, actor: { id: string; email: string; role: string }) {
    await this.getProductById(id, true);
    await productRepository.deleteProduct(id);

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'PRODUCT_DELETE',
      entityType: 'Product',
      entityId: id,
    });

    await this.clearProductCache();
  }

  async addVariant(
    productId: string,
    actor: { id: string; email: string; role: string },
    data: any
  ) {
    await this.getProductById(productId, true);

    const duplicateSku = await productRepository.findVariantBySku(data.sku);
    if (duplicateSku) {
      throw new ConflictError(`Duplicate SKU detected: ${data.sku} is already assigned.`);
    }

    const variant = await productRepository.createVariant(productId, data);

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'PRODUCT_VARIANT_ADD',
      entityType: 'ProductVariant',
      entityId: variant.id,
      metadata: { sku: variant.sku, size: variant.size },
    });

    await this.clearProductCache();
    return variant;
  }

  async updateVariant(
    variantId: string,
    actor: { id: string; email: string; role: string },
    data: any
  ) {
    const variant = await productRepository.findVariantById(variantId);
    if (!variant) {
      throw new NotFoundError('Fragrance variant not found.');
    }

    if (data.sku) {
      const duplicateSku = await productRepository.findVariantBySku(data.sku);
      if (duplicateSku && duplicateSku.id !== variantId) {
        throw new ConflictError(`SKU ${data.sku} already assigned to another variant.`);
      }
    }

    const updated = await productRepository.updateVariant(variantId, data);

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'PRODUCT_VARIANT_UPDATE',
      entityType: 'ProductVariant',
      entityId: variantId,
      metadata: data,
    });

    await this.clearProductCache();
    return updated;
  }

  async deleteVariant(variantId: string, actor: { id: string; email: string; role: string }) {
    const variant = await productRepository.findVariantById(variantId);
    if (!variant) {
      throw new NotFoundError('Fragrance variant not found.');
    }

    await productRepository.deleteVariant(variantId);

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'PRODUCT_VARIANT_DELETE',
      entityType: 'ProductVariant',
      entityId: variantId,
    });

    await this.clearProductCache();
  }

  async uploadProductImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestError('No image file provided for upload.');
    }
    const fileUrl = await uploadToStorage(file);
    return { imageUrl: fileUrl };
  }
}

export const productService = new ProductService();
