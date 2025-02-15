import { schemaId, schemaOrgId } from '@specfy/core';
import type { Prisma } from '@specfy/db';
import { prisma } from '@specfy/db';
import { toApiUser } from '@specfy/models';
import type { ListPerms } from '@specfy/models';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
    })
    .strict()
    .partial({ project_id: true })
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListPerms>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;
    const where: Prisma.PermsWhereInput = {
      orgId: query.org_id,
      projectId: query.project_id || null,
    };

    const perms = await prisma.perms.findMany({
      where,
      include: { User: true },
      orderBy: { createdAt: 'asc' },
      // TODO: proper pagination?
      take: 500,
      skip: 0,
    });

    return res.status(200).send({
      data: perms.map((p) => {
        // For excess property check
        const tmp: ListPerms['Success']['data'][0] = {
          id: p.id,
          orgId: p.orgId,
          projectId: p.projectId,
          user: toApiUser(p.User!),
          role: p.role,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
        return tmp;
      }),
    });
  });
  done();
};

export default fn;
