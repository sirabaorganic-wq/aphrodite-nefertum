import { prisma } from '../config/db.js';
import { logger } from './logger.js';

export async function logAuditAction(params: {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: any;
}) {
  try {
    const metadataStr = params.metadata ? JSON.stringify(params.metadata) : null;
    
    // Create audit log in database
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        actorEmail: params.actorEmail || null,
        actorRole: params.actorRole || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        metadata: metadataStr,
      },
    });

    logger.debug(`Audit Log created: [${params.action}] on [${params.entityType}:${params.entityId || 'none'}]`);
  } catch (error: any) {
    // Fail silently to prevent user action crashes due to audit logging failures, but write warning
    logger.warn(`Failed to write Audit Log for action ${params.action}: ${error.message}`);
  }
}
