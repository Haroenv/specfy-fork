import { toApiOrgPublic, toApiUser } from '@specfy/models';
import type { GetInvitation } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';

import { forbidden } from '../../../common/errors.js';
import { getInvitation } from '../../../middlewares/getInvitation.js';
import { noBody } from '../../../middlewares/noBody.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetInvitation>(
    '/',
    { preHandler: [noBody, getInvitation] },
    async function (req, res) {
      const inv = req.invitation!;
      const user = req.me!;

      if (user.email !== inv.email) {
        return forbidden(res);
      }

      return res.status(200).send({
        data: {
          id: inv.id,
          email: inv.email,
          userId: inv.userId,
          orgId: inv.orgId,
          role: inv.role,
          by: toApiUser(inv.User),
          org: toApiOrgPublic(inv.Org),
          createdAt: inv.createdAt,
          expiresAt: inv.expiresAt,
        },
      });
    }
  );
  done();
};

export default fn;
