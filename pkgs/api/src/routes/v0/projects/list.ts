import type { FastifyPluginCallback } from 'fastify';

import { Project } from '../../../models';
import type { Pagination } from '../../../types/api/api';
import type {
  ReqListProjects,
  ResListProjects,
} from '../../../types/api/projects';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListProjects; Reply: ResListProjects }>(
    '/',
    async function (req, res) {
      const pagination: Pagination = {
        current: 0,
        page: 0,
        total: 0,
      };
      console.log(req.query.org_id);

      const projects = await Project.findAll({
        where: {
          // TODO: validation
          orgId: req.query.org_id,
        },
        limit: 10,
        offset: 0,
      });

      res.status(200).send({
        data: projects.map((p) => {
          return {
            id: p.id,
            description: p.description,
            links: p.links,
            name: p.name,
            orgId: p.orgId,
            slug: p.slug,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          };
        }),
        pagination,
      });
    }
  );

  done();
};

export default fn;
