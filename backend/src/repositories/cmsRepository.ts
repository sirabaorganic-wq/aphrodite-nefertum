import { prisma } from '../config/db.js';
import { CMSType } from '@prisma/client';

export class CmsRepository {
  async findBySlug(slug: string, includeInactive: boolean = false) {
    const where: any = { slug };
    if (!includeInactive) {
      where.isActive = true;
    }
    return prisma.cMSContent.findUnique({
      where,
    });
  }

  async findById(id: string) {
    return prisma.cMSContent.findUnique({
      where: { id },
    });
  }

  async findByType(type: string, includeInactive: boolean = false) {
    const where: any = { type: type as CMSType };
    if (!includeInactive) {
      where.isActive = true;
    }
    return prisma.cMSContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createContent(data: {
    type: 'JOURNAL' | 'PHILOSOPHY' | 'BOTANICS' | 'CAREGUIDE' | 'POLICY_PRIVACY' | 'POLICY_TERMS' | 'POLICY_RETURNS';
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    mediaUrl?: string;
    isActive?: boolean;
  }) {
    return prisma.cMSContent.create({
      data: {
        type: data.type as CMSType,
        title: data.title,
        slug: data.slug.toLowerCase(),
        content: data.content,
        excerpt: data.excerpt || null,
        mediaUrl: data.mediaUrl || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateContent(id: string, data: any) {
    if (data.slug) {
      data.slug = data.slug.toLowerCase();
    }
    if (data.type) {
      data.type = data.type as CMSType;
    }
    return prisma.cMSContent.update({
      where: { id },
      data,
    });
  }

  async deleteContent(id: string) {
    return prisma.cMSContent.delete({
      where: { id },
    });
  }
}

export const cmsRepository = new CmsRepository();
