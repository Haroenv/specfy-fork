import type { Authenticator } from '@fastify/passport';
import type { Keys } from '@specfy/db';
import { prisma } from '@specfy/db';
import { userGithubApp } from '@specfy/models';
import type { FastifyInstance } from 'fastify';
import { Strategy as KeyStrategy } from 'passport-http-bearer';

// API KEY
export function registerKey(fastify: FastifyInstance, passport: Authenticator) {
  const reg = new KeyStrategy(async (token, done) => {
    if (!token.startsWith('spfy_') || token.length !== 29) {
      return done('key is invalid', false);
    }

    const key = await prisma.keys.findUnique({
      where: { id: token },
    });
    if (key) {
      return done(null, key);
    }

    // No user
    return done(null, false);
  });

  passport.use('key', reg);

  // Fallback on Json web token if any
  fastify.addHook(
    'preValidation',
    //@ts-expect-error
    passport.authenticate('key', async (req, res, err, key?: Keys) => {
      if (req.me) {
        return;
      }

      if (!key) {
        return;
      }

      req.me = userGithubApp;
      req.key = key;
      req.perms = [
        {
          id: '',
          orgId: key.orgId,
          projectId: null,
          role: 'owner',
          userId: req.me.id,
          createdAt: key.createdAt,
          updatedAt: key.createdAt,
          Org: {} as any,
        },
      ];
      if (key.projectId) {
        req.perms.push({
          id: '',
          orgId: key.orgId,
          projectId: key.projectId,
          role: 'owner',
          userId: req.me.id,
          createdAt: key.createdAt,
          updatedAt: key.createdAt,
          Org: {} as any,
        });
      }
    })
  );
}
