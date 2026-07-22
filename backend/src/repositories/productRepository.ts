import { prisma } from '../config/db.js';
import { CollectionType, ProductStatus, VariantType } from '@prisma/client';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export interface ProductFilters {
  search?: string;
  collection?: 'nefertum' | 'aphrodite';
  scent?: string;
  mood?: string;
  intensity?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'recommended';
  page: number;
  limit: number;
  includeDrafts?: boolean;
}

export class ProductRepository {
  async findProducts(filters: ProductFilters) {
    const where: any = {};

    // Drafts / Published logic
    if (!filters.includeDrafts) {
      where.status = ProductStatus.PUBLISHED;
    }

    if (filters.collection) {
      where.collection = filters.collection as CollectionType;
    }

    if (filters.intensity) {
      where.intensity = filters.intensity;
    }

    // Search query (case-insensitive search on name or description)
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Array searches on variants (scents, moods) or price ranges
    const variantConditions: any = {};
    if (filters.scent) {
      variantConditions.scents = { has: filters.scent.toLowerCase() };
    }
    if (filters.mood) {
      variantConditions.mood = { has: filters.mood.toLowerCase() };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      variantConditions.price = {};
      if (filters.minPrice !== undefined) {
        variantConditions.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        variantConditions.price.lte = filters.maxPrice;
      }
    }

    if (Object.keys(variantConditions).length > 0) {
      where.variants = {
        some: variantConditions,
      };
    }

    // Pagination
    const skip = (filters.page - 1) * filters.limit;
    const take = filters.limit;

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (filters.sortBy === 'price_asc') {
      orderBy = { variants: { _count: 'desc' } }; // Prisma cannot easily sort parent by child relation minimum price directly without raw queries, so we sort by createdAt or handle sorting in service, but let's do a reliable fallback orderBy
    } else if (filters.sortBy === 'price_desc') {
      orderBy = { variants: { _count: 'desc' } };
    } else if (filters.sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (filters.sortBy === 'recommended') {
      orderBy = { intensity: 'desc' };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: true,
        },
        orderBy,
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    // Perform sorting by minimum variant price if price sort requested
    if (filters.sortBy === 'price_asc') {
      products.sort((a, b) => {
        const aMin = Math.min(...a.variants.map(v => v.price), Infinity);
        const bMin = Math.min(...b.variants.map(v => v.price), Infinity);
        return aMin - bMin;
      });
    } else if (filters.sortBy === 'price_desc') {
      products.sort((a, b) => {
        const aMin = Math.min(...a.variants.map(v => v.price), -Infinity);
        const bMin = Math.min(...b.variants.map(v => v.price), -Infinity);
        return bMin - aMin;
      });
    }

    return {
      products,
      totalCount,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(totalCount / filters.limit),
    };
  }

  async findProductById(id: string, includeDrafts: boolean = false) {
    const where: any = { id };
    if (!includeDrafts) {
      where.status = ProductStatus.PUBLISHED;
    }
    return prisma.product.findFirst({
      where,
      include: {
        variants: true,
      },
    });
  }

  async findProductByName(name: string) {
    return prisma.product.findUnique({
      where: { name },
      include: { variants: true },
    });
  }

  async findProductBySlug(slug: string, includeDrafts: boolean = false) {
    const where: any = { slug };
    if (!includeDrafts) {
      where.status = ProductStatus.PUBLISHED;
    }
    return prisma.product.findFirst({
      where,
      include: {
        variants: true,
      },
    });
  }

  async createProduct(data: {
    name: string;
    collection: 'nefertum' | 'aphrodite';
    description: string;
    intensity: number;
    sillage: string;
    longevity: string;
    projection: string;
    status?: 'DRAFT' | 'PUBLISHED';
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        collection: data.collection as CollectionType,
        description: data.description,
        intensity: data.intensity,
        sillage: data.sillage,
        longevity: data.longevity,
        projection: data.projection,
        status: data.status as ProductStatus || ProductStatus.PUBLISHED,
      },
    });
  }

  async updateProduct(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data,
      include: { variants: true },
    });
  }

  async deleteProduct(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  async findVariantById(id: string) {
    return prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  async findVariantBySku(sku: string) {
    return prisma.productVariant.findUnique({
      where: { sku },
    });
  }

  async createVariant(productId: string, data: {
    size: string;
    type: 'extrait' | 'eau_de_parfum' | 'eau_de_toilette';
    sku: string;
    price: number;
    discountPrice?: number;
    stock: number;
    ingredients: string[];
    scents: string[];
    mood: string[];
    topNotes: string[];
    heartNotes: string[];
    baseNotes: string[];
  }) {
    return prisma.productVariant.create({
      data: {
        productId,
        sku: data.sku,
        size: data.size,
        type: data.type as VariantType,
        price: data.price,
        discountPrice: data.discountPrice,
        stock: data.stock,
        ingredients: data.ingredients,
        scents: data.scents.map(s => s.toLowerCase()),
        mood: data.mood.map(m => m.toLowerCase()),
        topNotes: data.topNotes,
        heartNotes: data.heartNotes,
        baseNotes: data.baseNotes,
      },
    });
  }

  async updateVariant(id: string, data: any) {
    if (data.scents) data.scents = data.scents.map((s: string) => s.toLowerCase());
    if (data.mood) data.mood = data.mood.map((m: string) => m.toLowerCase());
    
    return prisma.productVariant.update({
      where: { id },
      data,
    });
  }

  async deleteVariant(id: string) {
    return prisma.productVariant.delete({
      where: { id },
    });
  }
}

export const productRepository = new ProductRepository();
