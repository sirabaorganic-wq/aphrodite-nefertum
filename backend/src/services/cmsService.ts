import { cmsRepository } from '../repositories/cmsRepository.js';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/customError.js';
import { logAuditAction } from '../utils/auditLogger.js';

export class CmsService {
  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-'); // Replace multiple - with single -
  }

  async getContentBySlug(slug: string, includeInactive: boolean = false) {
    const content = await cmsRepository.findBySlug(slug, includeInactive);
    if (!content) {
      throw new NotFoundError(`CMS content with slug "${slug}" not found.`);
    }
    return content;
  }

  async getContentByType(type: string, includeInactive: boolean = false) {
    const validTypes = ['JOURNAL', 'PHILOSOPHY', 'BOTANICS', 'CAREGUIDE', 'POLICY_PRIVACY', 'POLICY_TERMS', 'POLICY_RETURNS'];
    if (!validTypes.includes(type)) {
      throw new BadRequestError('Invalid CMS content category type.');
    }
    return cmsRepository.findByType(type, includeInactive);
  }

  async createContent(
    actor: { id: string; email: string; role: string },
    data: {
      type: 'JOURNAL' | 'PHILOSOPHY' | 'BOTANICS' | 'CAREGUIDE' | 'POLICY_PRIVACY' | 'POLICY_TERMS' | 'POLICY_RETURNS';
      title: string;
      slug?: string;
      content: string;
      excerpt?: string;
      mediaUrl?: string;
      isActive?: boolean;
    }
  ) {
    const targetSlug = this.slugify(data.slug || data.title);
    
    const existing = await cmsRepository.findBySlug(targetSlug, true);
    if (existing) {
      throw new ConflictError(`CMS Content with slug "${targetSlug}" already exists.`);
    }

    const content = await cmsRepository.createContent({
      ...data,
      slug: targetSlug,
    });

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'CMS_CONTENT_CREATE',
      entityType: 'CMSContent',
      entityId: content.id,
      metadata: { slug: content.slug, type: content.type },
    });

    return content;
  }

  async updateContent(
    id: string,
    actor: { id: string; email: string; role: string },
    data: any
  ) {
    const content = await cmsRepository.findById(id);
    if (!content) {
      throw new NotFoundError('CMS Content not found.');
    }

    if (data.slug) {
      data.slug = this.slugify(data.slug);
      const existing = await cmsRepository.findBySlug(data.slug, true);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Slug "${data.slug}" is already in use.`);
      }
    }

    const updated = await cmsRepository.updateContent(id, data);

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'CMS_CONTENT_UPDATE',
      entityType: 'CMSContent',
      entityId: id,
      metadata: data,
    });

    return updated;
  }

  async deleteContent(id: string, actor: { id: string; email: string; role: string }) {
    const content = await cmsRepository.findById(id);
    if (!content) {
      throw new NotFoundError('CMS Content not found.');
    }

    await cmsRepository.deleteContent(id);

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'CMS_CONTENT_DELETE',
      entityType: 'CMSContent',
      entityId: id,
      metadata: { slug: content.slug },
    });
  }
}

export const cmsService = new CmsService();
