/**
 * Design System Constants for APHRODITE NEFERTUM
 * Dark Luxury + Mythology + Performance
 */

export const colors = {
  // Primary Dark Background
  background: '#050505',
  // Luxury Gold Accent
  gold: '#C6A972',
  goldHover: '#D4B896',
  // Text Colors
  textPrimary: '#F5E7C8',
  textSecondary: '#A89968',
  textMuted: '#6B5F4A',
  // Accent Colors
  accentCream: '#EDE4D3',
  accentBronze: '#8B7355',
  // Utility
  border: '#2A2520',
  borderLight: '#3D3630',
  success: '#4CAF50',
  error: '#FF6B6B',
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
  '4xl': '4rem',
};

export const typography = {
  // Serif for headings (Playfair Display)
  headingFont: 'font-serif',
  // Sans serif for body (Geist)
  bodyFont: 'font-sans',
};

export const breakpoints = {
  mobile: '640px',
  tablet: '1024px',
  desktop: '1280px',
};

// Product data structure
export interface Product {
  id: string;
  name: string;
  collection: 'nefertum' | 'aphrodite' | string;
  type?: 'extrait' | 'eau-de-parfum' | 'eau-de-toilette' | string;
  price?: number;
  image?: string;
  description?: string;
  ingredients?: string[];
  scents?: string[];
  mood?: string[];
  intensity?: number; // 1-5
  notes?: {
    top: string[];
    heart: string[];
    base: string[];
  };
  performance?: {
    longevity: string;
    sillage: string;
    projection: string;
  };
  variants?: any[];
  [key: string]: any;
}


export const collections = [
  {
    id: 'nefertum',
    name: 'NEFERTUM COLLECTION',
    tagline: 'The Power of Fragrance Embodied',
    description:
      'Inspired by divinity, crafted for you. A collection born from ancient wisdom and modern performance.',
    image: '/images/nefertum-collection.svg',
  },
  {
    id: 'aphrodite',
    name: 'APHRODITE COLLECTION',
    tagline: 'The Power of Allure',
    description:
      'Engineered for India, perfected for you. Celebrate the essence of desire and sophistication.',
    image: '/images/aphrodite-collection.svg',
  },
];

export const climateFeatures = [
  {
    icon: 'Flame',
    title: 'High Heat Performance',
    description:
      'Engineered to perform in India&apos;s tropical climate without fading.',
  },
  {
    icon: 'Droplets',
    title: 'Humidity Resistant',
    description: 'Maintains projection and longevity even in high humidity.',
  },
  {
    icon: 'Wind',
    title: 'Crafted with Precision',
    description: 'Every molecule optimized for maximum impact and durability.',
  },
  {
    icon: 'Zap',
    title: 'Guaranteed Performance',
    description: 'Our promise: premium quality that lasts through the day.',
  },
];

export const journalArticles = [
  {
    id: 1,
    title: 'The Myth of Nefertum and the Sacred Lotus',
    excerpt: 'Stories, rituals, and traditions from the ancient world.',
    image: '/images/journal-1.svg',
  },
  {
    id: 2,
    title: 'Rituals for the Modern Conqueror',
    excerpt: 'How fragrance shapes identity and intention.',
    image: '/images/journal-2.svg',
  },
  {
    id: 3,
    title: 'The Art of Layering in Tropical Climates',
    excerpt: 'Master the technique for maximum impact and longevity.',
    image: '/images/journal-3.svg',
  },
];
