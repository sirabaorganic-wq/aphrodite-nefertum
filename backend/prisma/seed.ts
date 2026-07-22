import { PrismaClient, Role, CollectionType, VariantType, CMSType, CouponDiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Redis } from 'ioredis';

const prisma = new PrismaClient();

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Seeding database...');

  // 1. Clear Existing Data
  await prisma.auditLog.deleteMany({});
  await prisma.webhookEvent.deleteMany({});
  await prisma.cMSContent.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.stockReservation.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
  const consumerPasswordHash = await bcrypt.hash('User@123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@sirabaorganic.com',
      passwordHash: adminPasswordHash,
      firstName: 'Nefertum',
      lastName: 'Admin',
      phone: '+919999999999',
      role: Role.ADMIN,
    },
  });

  const consumer = await prisma.user.create({
    data: {
      email: 'consumer@example.com',
      passwordHash: consumerPasswordHash,
      firstName: 'Aphrodite',
      lastName: 'Consumer',
      phone: '+918888888888',
      role: Role.CONSUMER,
    },
  });

  console.log('Users created: Admin (admin@sirabaorganic.com) and Consumer (consumer@example.com)');

  // 3. Create Products and Product Variants
  // Product 1: OUDH IMMORTEL
  const oudh = await prisma.product.create({
    data: {
      name: 'OUDH IMMORTEL',
      slug: slugify('OUDH IMMORTEL'),
      collection: CollectionType.nefertum,
      description: 'An intense blend of raw oud, spices and notes of saffron and bergamot. An olfactory journey inspired by the power of divinity.',
      intensity: 5,
      sillage: 'Intense',
      longevity: '12+ hours',
      projection: 'Strong',
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: oudh.id,
        sku: 'NEF-OUD-EXT-50',
        size: '50ml',
        type: VariantType.extrait,
        price: 6999.00,
        discountPrice: 6499.00,
        stock: 50,
        ingredients: ['Oud', 'Saffron', 'Bergamot', 'Black Pepper', 'Vetiver', 'Amber'],
        scents: ['oud', 'spicy', 'woody'],
        mood: ['powerful', 'confident'],
        topNotes: ['Bergamot', 'Black Pepper'],
        heartNotes: ['Saffron', 'Oud'],
        baseNotes: ['Vetiver', 'Amber', 'Sandalwood'],
      },
      {
        productId: oudh.id,
        sku: 'NEF-OUD-EXT-100',
        size: '100ml',
        type: VariantType.extrait,
        price: 11999.00,
        stock: 35,
        ingredients: ['Oud', 'Saffron', 'Bergamot', 'Black Pepper', 'Vetiver', 'Amber'],
        scents: ['oud', 'spicy', 'woody'],
        mood: ['powerful', 'confident'],
        topNotes: ['Bergamot', 'Black Pepper'],
        heartNotes: ['Saffron', 'Oud'],
        baseNotes: ['Vetiver', 'Amber', 'Sandalwood'],
      },
    ],
  });

  // Product 2: SACRED LOTUS
  const lotus = await prisma.product.create({
    data: {
      name: 'SACRED LOTUS',
      slug: slugify('SACRED LOTUS'),
      collection: CollectionType.nefertum,
      description: 'A delicate floral composition centered around the sacred lotus blossom, infused with hints of green tea and sandalwood.',
      intensity: 3,
      sillage: 'Moderate',
      longevity: '8-10 hours',
      projection: 'Moderate',
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: lotus.id,
        sku: 'NEF-LOT-EDP-50',
        size: '50ml',
        type: VariantType.eau_de_parfum,
        price: 5999.00,
        stock: 40,
        ingredients: ['Lotus', 'Green Tea', 'Sandalwood', 'Rose', 'Jasmine'],
        scents: ['floral', 'green', 'woody'],
        mood: ['serene', 'spiritual'],
        topNotes: ['Green Tea', 'Bergamot'],
        heartNotes: ['Lotus', 'Rose', 'Jasmine'],
        baseNotes: ['Sandalwood', 'Musk'],
      },
      {
        productId: lotus.id,
        sku: 'NEF-LOT-EDP-100',
        size: '100ml',
        type: VariantType.eau_de_parfum,
        price: 9999.00,
        discountPrice: 8999.00,
        stock: 20,
        ingredients: ['Lotus', 'Green Tea', 'Sandalwood', 'Rose', 'Jasmine'],
        scents: ['floral', 'green', 'woody'],
        mood: ['serene', 'spiritual'],
        topNotes: ['Green Tea', 'Bergamot'],
        heartNotes: ['Lotus', 'Rose', 'Jasmine'],
        baseNotes: ['Sandalwood', 'Musk'],
      },
    ],
  });

  // Product 3: DESERT OBSIDIAN
  const desert = await prisma.product.create({
    data: {
      name: 'DESERT OBSIDIAN',
      slug: slugify('DESERT OBSIDIAN'),
      collection: CollectionType.aphrodite,
      description: 'A mysterious blend inspired by desert nights. Dark, sensual notes of leather, patchouli and musk create an intoxicating allure.',
      intensity: 4,
      sillage: 'Strong',
      longevity: '10-12 hours',
      projection: 'Strong',
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: desert.id,
        sku: 'APH-DES-EDP-50',
        size: '50ml',
        type: VariantType.eau_de_parfum,
        price: 5499.00,
        stock: 12, // Low stock for testing low-stock alerts
        ingredients: ['Leather', 'Patchouli', 'Musk', 'Oud', 'Vanilla'],
        scents: ['leather', 'woody', 'sensual'],
        mood: ['mysterious', 'seductive'],
        topNotes: ['Cinnamon', 'Cardamom'],
        heartNotes: ['Leather', 'Patchouli'],
        baseNotes: ['Musk', 'Vanilla', 'Oud'],
      },
      {
        productId: desert.id,
        sku: 'APH-DES-EDP-100',
        size: '100ml',
        type: VariantType.eau_de_parfum,
        price: 8999.00,
        stock: 2, // Very low stock alert
        ingredients: ['Leather', 'Patchouli', 'Musk', 'Oud', 'Vanilla'],
        scents: ['leather', 'woody', 'sensual'],
        mood: ['mysterious', 'seductive'],
        topNotes: ['Cinnamon', 'Cardamom'],
        heartNotes: ['Leather', 'Patchouli'],
        baseNotes: ['Musk', 'Vanilla', 'Oud'],
      },
    ],
  });

  console.log('Products and ProductVariants seeded.');

  // 4. Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        discountType: CouponDiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderValue: 2000,
        maxDiscount: 1000,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        usageLimit: 100,
      },
      {
        code: 'LUXURY1000',
        discountType: CouponDiscountType.FLAT,
        discountValue: 1000,
        minOrderValue: 8000,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        usageLimit: 50,
      },
    ],
  });

  console.log('Coupons seeded.');

  // 5. Create CMS Content
  await prisma.cMSContent.createMany({
    data: [
      {
        type: CMSType.PHILOSOPHY,
        title: 'Engineered for India',
        slug: 'engineered-for-india',
        content: JSON.stringify({
          subtitle: 'TROPICAL PERFORMANCE OPTIMIZATION',
          body: 'India experiences intense heat and humidity. Most luxury fragrances are designed for temperate European climates. Our formulations are enhanced to anchor to skin and perform under the tropical sun.',
          symbol: '▲',
        }),
      },
      {
        type: CMSType.PHILOSOPHY,
        title: 'Mythology Inspired',
        slug: 'mythology-inspired',
        content: JSON.stringify({
          subtitle: 'ANCIENT INGREDIENTS, BOLD STORIES',
          body: 'We draw from the deep scent-lore of ancient times. From Egyptian Kyphi to Vedic aromatics, our fragrances connect you to history.',
          symbol: '✥',
        }),
      },
      {
        type: CMSType.PHILOSOPHY,
        title: 'Performance Obsessed',
        slug: 'performance-obsessed',
        content: JSON.stringify({
          subtitle: 'COMPROMISE ON NOTHING',
          body: 'We test sillage, longevity and projection under rigorous conditions. You get a fragrance that leaves an unforgettable trail.',
          symbol: '❖',
        }),
      },
      {
        type: CMSType.BOTANICS,
        title: 'Rare Ingredients Catalog',
        slug: 'rare-ingredients-catalog',
        content: 'Our ingredients are sustainably sourced. Pure Assam Oud, hand-plucked Sacred Blue Lotus, and premium Indian Vetiver are blended in high concentrations (25%+ Extraits) for maximum depth.',
      },
      {
        type: CMSType.CAREGUIDE,
        title: 'Fragrance Preservation & Wear Guide',
        slug: 'fragrance-preservation-and-wear-guide',
        content: 'To maximize your fragrance trail: Apply to pulse points (wrist, neck, behind ears). Do not rub the wrists together, as this breaks down fragrance molecules. Store bottles in cool, dark environments away from temperature swings.',
      },
      {
        type: CMSType.POLICY_PRIVACY,
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: 'Your privacy is paramount. This policy outlines how we collect, store, and process your data. All transactions are securely encrypted via SSL.',
      },
      {
        type: CMSType.POLICY_TERMS,
        title: 'Terms of Service',
        slug: 'terms-of-service',
        content: 'By accessing Aphrodite Nefertum, you agree to our terms. Products are subject to availability and transactions are handled securely.',
      },
      {
        type: CMSType.POLICY_RETURNS,
        title: 'Returns & Refund Policy',
        slug: 'returns-policy',
        content: 'Fragrances are luxury items. Due to health and safety standards, opened bottles are non-returnable. If your shipment arrives damaged, contact us within 24 hours of delivery with photographic proof for an immediate replacement.',
      },
      {
        type: CMSType.JOURNAL,
        title: 'The Myth of Nefertum and the Sacred Lotus',
        slug: 'myth-of-nefertum',
        excerpt: 'Stories, rituals, and traditions from the ancient world.',
        content: 'Nefertum was the ancient Egyptian god of perfume and the sun. He arose from the primordial lotus blossom, representing creation and fragrance. In this article, we explore the sacred significance of the lotus in Egyptian rituals and how we recreate that majesty today.',
        mediaUrl: '/images/journal-1.jpg',
      },
    ],
  });

  console.log('CMS Contents seeded.');

  // Invalidate Redis product cache after seeding
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redis = new Redis(redisUrl, { lazyConnect: true });
  try {
    await redis.connect();
    const catalogKeys = await redis.keys('products:*');
    const singleKeys = await redis.keys('product:*');
    const allKeys = [...catalogKeys, ...singleKeys];
    if (allKeys.length > 0) {
      await redis.del(...allKeys);
      console.log(`Redis cache invalidated (${allKeys.length} product keys cleared).`);
    } else {
      console.log('No Redis product cache keys to invalidate.');
    }
    await redis.quit();
  } catch (e: any) {
    console.warn(`Redis cache invalidation skipped: ${e.message}`);
  }

  console.log('Database Seeding Successful! ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
