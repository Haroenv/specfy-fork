import { sendInvitation } from '@specfy/emails';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { resend } from '../../../common/emails.js';
import { envs } from '../../../common/env.js';
import { validationError } from '../../../common/errors.js';
import { nanoid } from '../../../common/id.js';
import { schemaOrgId } from '../../../common/validators/index.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import { logger } from '../../../logger.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { getUsage } from '../../../models/billing/model.js';
import { EXPIRES } from '../../../models/index.js';
import { getOrgFromRequest } from '../../../models/perms/helpers.js';
import { PermType } from '../../../models/perms/types.js';
import type { PostInvitation } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      orgId: schemaOrgId,
      email: z.string().max(250).email(),
      role: z.nativeEnum(PermType),
    })
    .strict()
    .superRefine(valPermissions(req, 'owner'))
    .superRefine(async (val, ctx) => {
      const count = await prisma.perms.count({
        where: {
          orgId: val.orgId,
          User: { email: val.email },
          projectId: null,
        },
      });
      if (count > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'exists' },
          message: 'User is already part of this organization',
          path: ['email'],
        });
      }

      const org = getOrgFromRequest(req, val.orgId);
      if (!org) {
        return;
      }

      const usage = await getUsage(org);
      if (usage.users.pct >= 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'max' },
          message:
            "You can't have more people in your team, upgrade your plan or contact us if you need more",
          path: ['email'],
        });
      }
    });
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostInvitation>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = await QueryVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const body = val.data;
      const me = req.me!;

      // Dedup and invalidate old invites
      await prisma.invitations.deleteMany({
        where: {
          email: body.email,
          orgId: body.orgId,
        },
      });

      const created = await prisma.invitations.create({
        data: {
          id: nanoid(),
          email: body.email,
          orgId: body.orgId,
          role: body.role,
          token: nanoid(32),
          userId: req.me!.id,
          expiresAt: new Date(Date.now() + EXPIRES),
        },
      });

      if (!process.env.VITEST) {
        const link = `${envs.APP_HOSTNAME}/invite?invitation_id=${created.id}&token=${created.token}`;
        const org = getOrgFromRequest(req, body.orgId)!;
        logger.info('Sending email', { to: body.email, type: 'invitation' });
        await sendInvitation(
          resend,
          {
            from: 'Specfy <support@app.specfy.io>',
            subject: `Join ${org.name} on Specfy`,
            to: body.email,
          },
          {
            email: body.email,
            invitedBy: me,
            inviteLink: link,
            org,
          }
        );
      }

      return res.status(200).send({
        data: { token: created.token, id: created.id },
      });
    }
  );
  done();
};

export default fn;
