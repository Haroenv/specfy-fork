import type { Projects } from '@prisma/client';

import type { ApiProject, BlockLevelZero } from '../../types/api';
import type {
  DBProjectLink,
  GraphEdge,
  GraphItemDisplay,
} from '../../types/db';

export function toApiProject(proj: Projects): ApiProject {
  return {
    id: proj.id,
    orgId: proj.orgId,
    blobId: proj.blobId,
    description: proj.description as unknown as BlockLevelZero,
    name: proj.name,
    slug: proj.slug,
    links: proj.links as unknown as DBProjectLink[], // TODO: remove this in /list
    display: proj.display as unknown as GraphItemDisplay,
    edges: proj.edges as unknown as GraphEdge[],
    createdAt: proj.createdAt.toISOString(),
    updatedAt: proj.updatedAt.toISOString(),
  };
}
