import type { Prisma } from '@specfy/db';

import type { BlockLevelZero } from '../documents';

export interface DBRevision {
  id: string;

  orgId: string;
  projectId: string;

  name: string;
  description: BlockLevelZero;
  blobs: string[];
  locked: boolean;
  status: 'approved' | 'closed' | 'draft' | 'waiting';
  merged: boolean;

  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  closedAt: string | null;
}

export type RevisionWithProject = Prisma.RevisionsGetPayload<{
  include: { Project: true; TypeHasUsers: { include: { User: true } } };
}>;
