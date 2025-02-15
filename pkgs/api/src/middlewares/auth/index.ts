import { Authenticator } from '@fastify/passport';
import fastifySession from '@fastify/secure-session';
import { envs } from '@specfy/core';
import type { Users } from '@specfy/db';
import { prisma } from '@specfy/db';
import type { FastifyInstance } from 'fastify';

import { unauthorized } from '../../common/errors.js';

import { registerGithub } from './github.js';
import { registerJwt } from './jwt.js';
import { registerKey } from './key.js';
import { registerLocal } from './local.js';

const ALLOW_GUEST = [
  '/*',
  '/0/',
  '/favicon.ico',
  '/0/auth/github',
  '/0/auth/github/cb',
  '/0/auth/local',
  '/0/github/webhooks',
  '/0/stripe/webhooks',
];
const COOKIE_SECRET = Buffer.from(envs.COOKIE_SECRET, 'hex');

export const fastifyPassport = new Authenticator();

export async function registerAuth(f: FastifyInstance) {
  await f.register(fastifySession, {
    sessionName: 'session',
    cookieName: 'specfy-app-session',
    cookie: {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    key: COOKIE_SECRET,
  });
  await f.register(fastifyPassport.initialize());
  await f.register(fastifyPassport.secureSession());

  // Cookie pre validation
  f.addHook('preValidation', async (req) => {
    let id = req.session.get('passport')?.id;

    if (!id && envs.DEFAULT_ACCOUNT) {
      // In dev we can auto-load the default user
      const tmp = await prisma.users.findUnique({
        where: { email: envs.DEFAULT_ACCOUNT },
      });
      if (!tmp) {
        throw new Error('Missing default account');
      }
      id = tmp.id;
    }

    if (!id) {
      return;
    }

    const user = await prisma.users.findUnique({
      where: { id },
    });
    const perms = await prisma.perms.findMany({
      where: {
        userId: id,
      },
      include: { Org: { include: { Projects: { select: { id: true } } } } },
    });
    req.me = user!;
    req.perms = perms;
  });

  // JSON WEB TOKEN
  registerKey(f, fastifyPassport);

  // JSON WEB TOKEN
  registerJwt(f, fastifyPassport);

  // LOCAL
  registerLocal(f, fastifyPassport);

  // GITHUB OAUTH
  if (envs.GITHUB_CLIENT_ID) {
    registerGithub(fastifyPassport);
  }

  fastifyPassport.registerUserSerializer(async (user: Users) => {
    return Promise.resolve({ id: user.id });
  });

  // Deserializer will fetch the user from the database when a request with an id in the session arrives
  fastifyPassport.registerUserDeserializer(async (user: unknown) => {
    return Promise.resolve(user);
  });

  // Final check to see if we are connected
  f.addHook('preValidation', (req, res, done) => {
    if (req.me) {
      done();
      return;
    }

    if (ALLOW_GUEST.includes(req.routerPath)) {
      done();
      return;
    }

    return unauthorized(res);
  });
}
