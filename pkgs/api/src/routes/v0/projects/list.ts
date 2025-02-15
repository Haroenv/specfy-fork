import { schemaOrgId } from '@specfy/core';
import type { Pagination } from '@specfy/core';
import { prisma } from '@specfy/db';
import { toApiProjectList } from '@specfy/models';
import type { ListProjects } from '@specfy/models';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListProjects>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: ListProjects['Querystring'] = val.data;

    // TODO: pagination
    const pagination: Pagination = {
      currentPage: 0,
      totalItems: 0,
    };

    const projects = await prisma.projects.findMany({
      where: {
        orgId: query.org_id,
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { Perms: true },
        },
      },
      take: 50,
      skip: 0,
    });

    return res.status(200).send({
      data: projects.map(toApiProjectList),
      pagination,
    });
  });
  done();
};

export default fn;
