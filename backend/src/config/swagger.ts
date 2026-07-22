import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aphrodite Nefertum E-Commerce API',
      version: '1.0.0',
      description: `
## Enterprise-Grade REST API

Role-based e-commerce backend for **Aphrodite Nefertum** luxury fragrance platform.

### Authentication
All protected routes use **Bearer JWT tokens** in the Authorization header:
\`\`\`
Authorization: Bearer <accessToken>
\`\`\`

### Roles
- **CONSUMER** — Standard user: shop, cart, checkout, orders, wishlist, addresses
- **ADMIN** — Full access: product management, CMS, analytics, order status, coupons

### Refresh Tokens
Issued as \`HttpOnly\` cookies on login/register. Call \`POST /api/v1/auth/refresh\` to rotate.
      `,
      contact: {
        name: 'Aphrodite Nefertum Tech',
        email: 'admin@sirabaorganic.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
      {
        url: 'https://api.aphroditenefertum.com',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & session management' },
      { name: 'Products', description: 'Fragrance catalog management' },
      { name: 'Cart', description: 'Shopping cart (authenticated & guest)' },
      { name: 'Wishlist', description: 'Saved fragrance wishlist' },
      { name: 'Addresses', description: 'User saved shipping addresses' },
      { name: 'Coupons', description: 'Discount coupon management' },
      { name: 'Orders', description: 'Checkout, payment & order management' },
      { name: 'Logistics', description: 'Shiprocket shipment webhooks' },
      { name: 'CMS', description: 'Journal, philosophies & policy content' },
      { name: 'Admin Analytics', description: 'Admin dashboard metrics & audit logs' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
